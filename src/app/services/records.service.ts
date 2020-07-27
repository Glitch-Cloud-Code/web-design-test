import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Record } from "../interfaces/record";

@Injectable({
  providedIn: "root",
})
export class RecordsService {
  private sessionId: string;
  private serviceURL: string = "https://test.rwl.lv/api/record";
  private headers: HttpHeaders;

  constructor(private http: HttpClient) {
    this.sessionId = "3ec6b80a248a3153687a0de5604830ca";
    this.headers = new HttpHeaders().append("SESSION", this.sessionId);
  }

  public getAllRecords(sort_dir: string, sort_by: string) {
    return this.http.get(this.serviceURL, {
      params: new HttpParams()
        .set("sort_dir", sort_dir)
        .set("sort_by", sort_by),
      headers: this.headers,
    });
  }

  public addRecord(record: Record) {
    return this.http.post(this.serviceURL, record, { headers: this.headers });
  }

  public deleteRecord(recordId: number) {
    return this.http.delete(this.serviceURL + "/" + recordId, {
      headers: this.headers,
    });
  }

  public patchName(recordId: number, newName: string) {
    return this.http.patch(
      this.serviceURL + "/" + recordId + "/name",
      { name: newName },
      { headers: this.headers }
    );
  }

  public patchSurname(recordId: number, newSurname: string) {
    return this.http.patch(
      this.serviceURL + "/" + recordId + "/surname",
      { surname: newSurname },
      { headers: this.headers }
    );
  }
}
