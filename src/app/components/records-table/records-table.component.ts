import { Component, OnInit, AfterViewInit, ViewChild } from "@angular/core";
import { RecordsService } from "src/app/services/records.service";
import { RecordsDataSource } from "src/app/data-sources/records-datasource";
import { Record } from "../../interfaces/record";
import { MatSort } from "@angular/material/sort";
import { FormGroup, FormControl, Validators } from "@angular/forms";

@Component({
  selector: "app-records-table",
  templateUrl: "./records-table.component.html",
  styleUrls: ["./records-table.component.scss"],
})
export class RecordsTableComponent implements OnInit, AfterViewInit {
  public dataSource: RecordsDataSource;
  public displayedColumns: string[] = [
    "id",
    "name",
    "surname",
    "send_mail_at",
    "hash",
    "actions",
  ];

  public columnDefinitions = [
    {def: "id", show:true},
    {def: "name", show:true},
    {def: "surname", show:true},
    {def: "send_mail_at", show:true},
    {def: "hash", show:true},
    {def: "actions", show:true}
  ]
  public bEditMode: boolean = false;
  public bAddMode: boolean = false;

  public editedRecordId: number = null;
  public savedRecordState: Record;
  public editRecord: Record;

  public createRecord: Record = {} as Record;

  private savedColumnsState;

  @ViewChild(MatSort) sort: MatSort;

  tableForm = new FormGroup({
    nameEditField: new FormControl("", [
      Validators.required,
      Validators.maxLength(32),
    ]),
    surnameEditField: new FormControl("", [
      Validators.required,
      Validators.maxLength(32),
    ]),
    nameCreateField: new FormControl("", [
      Validators.required,
      Validators.maxLength(32),
    ]),
    surnameCreateField: new FormControl("", [
      Validators.required,
      Validators.maxLength(32),
    ]),
    sendMailAtCreateField: new FormControl(new Date().toISOString()),
  });

  constructor(private recordsService: RecordsService) {}

  ngOnInit(): void {
    this.dataSource = new RecordsDataSource(this.recordsService);
    this.dataSource.getAllRecords();
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => {
      this.dataSource.getAllRecords(
        this.sort.direction.toUpperCase(),
        this.sort.active
      );
    });
  }

  public getDisplayedColumns(): string[] {
    return this.columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  public enableAddMode() {
    this.bAddMode = true;
    this.saveColumnsState();
    this.showAllColumns();
    this.createRecord = { send_mail_at: new Date().toISOString() } as Record;
    this.dataSource.addCreationField(this.createRecord);
  }

  public deleteRecord(recordId: number) {
    this.dataSource.deleteRecord(recordId);
  }

  public enableEditMode(record: Record) {
    this.bEditMode = true;
    this.saveColumnsState();
    this.showAllColumns();
    this.dataSource.saveCurrentState();
    this.editedRecordId = record.id;
    this.editRecord = record;
  }

  public confirmEdit(record: Record) {
    this.dataSource.editRecord(this.editedRecordId, {
      name: this.editRecord.name,
      surname: this.editRecord.surname,
    } as Record);
    this.editRecord = null;
    this.bEditMode = false;
    this.savedRecordState = null;
    this.editedRecordId = null;
    this.loadSavedColumnsState();
  }

  public cancelEdit(record: Record) {
    this.dataSource.loadLastSavedState();
    this.dataSource.wipeSavedState();
    this.editRecord = null;
    this.bEditMode = false;
    this.savedRecordState = null;
    this.editedRecordId = null;
    this.loadSavedColumnsState();
  }

  public confirmAdd() {
    this.dataSource.addNewRecord(this.createRecord);
    this.dataSource.removeCreationField();

    this.bAddMode = false;
    this.createRecord = null;
    this.loadSavedColumnsState();
  }

  public cancelAdd() {
    this.dataSource.removeCreationField();

    this.bAddMode = false;
    this.createRecord = null;
    this.loadSavedColumnsState();
  }

  private saveColumnsState() {
    this.savedColumnsState = JSON.parse(JSON.stringify(this.columnDefinitions));
  }

  private loadSavedColumnsState() {
    this.columnDefinitions = this.savedColumnsState;
  }

  private showAllColumns() {
    this.columnDefinitions.map(def => def.show = true);
  }
}
