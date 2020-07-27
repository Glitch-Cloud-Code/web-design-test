import { Component, OnInit, AfterViewInit, ViewChild } from "@angular/core";
import { RecordsService } from "src/app/services/records.service";
import { RecordsDataSource } from "src/app/data-sources/records-datasource";
import { Record } from "../../interfaces/record"
import { MatSort } from "@angular/material/sort";

@Component({
  selector: "app-records-table",
  templateUrl: "./records-table.component.html",
  styleUrls: ["./records-table.component.scss"],
})
export class RecordsTableComponent implements OnInit, AfterViewInit {
  public dataSource: RecordsDataSource;
  public displayedColumns = ["id", "name", "surname", "send_mail_at", "hash", "actions"];

  @ViewChild(MatSort) sort: MatSort;

  constructor(private recordsService: RecordsService) {}

  ngOnInit(): void {
    this.dataSource = new RecordsDataSource(this.recordsService);
    this.dataSource.getAllRecords();
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() =>
      this.dataSource.getAllRecords(
        this.sort.direction.toUpperCase(),
        this.sort.active
      )
    );
  }

  public addRecord() {
    this.dataSource.addNewRecord({name: 'Add', surname: "Test", send_mail_at: new Date().toISOString()} as Record);
  }

  public deleteRecord(recordId: number) {
    this.dataSource.deleteRecord(recordId);
  }

  public editRecord(recordId: number) {
    this.dataSource.editRecord(recordId, {name: 'EditedName', surname: "EditedSurname"} as Record)
  }
}
