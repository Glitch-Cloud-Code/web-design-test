import { Record } from "../interfaces/record";
import {
  BehaviorSubject,
  of,
  Observable,
  forkJoin,
  interval
} from "rxjs";
import { catchError, finalize, debounceTime, take} from "rxjs/operators";
import { RecordsService } from "../services/records.service";
import { CollectionViewer, DataSource } from "@angular/cdk/collections";


export class RecordsDataSource implements DataSource<Record> {
  private recordsSubject = new BehaviorSubject<Record[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private recordsService: RecordsService) {}

  connect(collectionViewer: CollectionViewer): Observable<Record[]> {
    return this.recordsSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.recordsSubject.complete();
    this.loadingSubject.complete();
  }

  getAllRecords(sortDirection = "ASC", sortBy = "id") {
    this.loadingSubject.next(true);

    this.recordsService
      .getAllRecords(sortDirection, sortBy)
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe((success) => this.recordsSubject.next(success["data"]));
  }

  addNewRecord(record: Record) {
    this.loadingSubject.next(true);
    this.recordsService
      .addRecord(record)
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe((success) => {
        this.addRecordLocally(success["data"] as Record);
      });
  }

  deleteRecord(recordId: number) {
    this.loadingSubject.next(true);
    this.recordsService
      .deleteRecord(recordId)
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe((success) => {
        this.deleteRecordLocally(recordId);
      });
  }

  editRecord(recordId: number, newRecord: Record) {
    let editedFields = this.getEditedFields(recordId, newRecord);
    if (editedFields.length < 1) {
      return;
    }

    this.sendPatchRequestsAndUpdateRecordLocally(editedFields, recordId, newRecord);
  }

  private async sendPatchRequestsAndUpdateRecordLocally(
    editedFields: String[],
    recordId: number,
    newRecord: Record
  ) {
    let observables = [];
    for (let i = 0; i < editedFields.length; i++) {
      switch (editedFields[i]) {
        case "name": {
          observables.push(this.recordsService
            .patchName(recordId, newRecord.name));
          break;
        }
        case "surname": {
          observables.push(this.recordsService
            .patchSurname(recordId, newRecord.surname));
          break;
        }
      }
    }
    interval(20).pipe(take(observables.length)).subscribe((x) =>
      observables[x].subscribe((success)=> {
        this.replaceRecordLocally(recordId, success['data']);
      })
    );
  }

  private addRecordLocally(record: Record) {
    this.recordsSubject.value.push(record);
    this.recordsSubject.next(this.recordsSubject.value);
  }

  private replaceRecordLocally(id: number, newRecord: Record) {
    let newValue = this.recordsSubject.value.map((record: Record) => {
      if (record.id == id) {
        return newRecord;
      } else {
        return record;
      }
    });

    this.recordsSubject.next(newValue);
  }

  private deleteRecordLocally(id: number) {
    let newValue = this.recordsSubject.value.filter(
      (record) => record.id != id
    );
    this.recordsSubject.next(newValue);
  }

  private getEditedFields(recordId: number, newRecord: Record): String[] {
    let result: String[] = [];
    let currentRecord = this.getLocalRecord(recordId);
    if (currentRecord.name != newRecord.name) {
      result.push("name");
    }
    if (currentRecord.surname != newRecord.surname) {
      result.push("surname");
    }
    return result;
  }

  private getLocalRecord(id: number) {
    return this.recordsSubject.value.find((record) => record.id == id);
  }
}
