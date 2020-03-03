import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
interface DialogData {
  column: string[];
  detail: string[];
}
@Component({
  selector: 'app-clinic-table',
  templateUrl: './clinic-table.component.html',
  styleUrls: ['./clinic-table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ClinicTableComponent implements OnInit {

  title: string;
  displayedColumns: string[];
  dataSource: MatTableDataSource<string[]>;
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  ngOnInit(): void {
    this.displayedColumns = ['category', 'value'];
    this.title = `${this.data.detail[this.getIndex(`機構代碼`)]}-${this.data.detail[this.getIndex(`機構名稱`)]}`;

    this.dataSource = new MatTableDataSource<string[]>();
    this.dataSource.data = this.data.column.map((_, index: number) => {
      return [this.data.column[index], this.data.detail[index]]
        ;
    });
  }

  private getIndex(column: string) {
    return this.data.column.indexOf(column);
  }
}
