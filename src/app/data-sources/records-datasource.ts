import { Record } from '../interfaces/record';
import { BehaviorSubject, of, Observable } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators'
import { RecordsService } from '../services/records.service';
import {CollectionViewer, DataSource} from "@angular/cdk/collections";

export class RecordsDataSource implements DataSource<Record> {

  private lessonsSubject = new BehaviorSubject<Record[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public loading$ = this.loadingSubject.asObservable();

  constructor(private coursesService: RecordsService) {}

  connect(collectionViewer: CollectionViewer): Observable<Record[]> {
      return this.lessonsSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
      this.lessonsSubject.complete();
      this.loadingSubject.complete();
  }

  getAllRecords(sortDirection = 'ASC', sortBy = 'id') {

      this.loadingSubject.next(true);

      this.coursesService.getAllRecords(sortDirection,
          sortBy).pipe(
          catchError(() => of([])),
          finalize(() => this.loadingSubject.next(false))
      )
      .subscribe(records => this.lessonsSubject.next(records['data']));
  }
}
