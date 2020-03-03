import { Component, TemplateRef, ViewChild, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

import { ClinicMapService } from './clinic-map.service';
import { ClinicTableComponent } from '../clinic-table/clinic-table.component';


@Component({
  selector: 'app-clinic-map',
  templateUrl: './clinic-map.component.html',
  styleUrls: ['./clinic-map.component.scss']
})
export class ClinicMapComponent implements OnInit {

  @ViewChild('overlay') overlayTemplate: TemplateRef<any>;

  csvData: any;
  csvDataMapping = [`機構代碼`, `機構名稱`, `權屬別`, `型態別`, `縣市鄉鎮`, `電話`, `地址`, `診療科別`, `醫師`, `中醫師`, `牙醫師`, `藥師`, `藥劑生`, `護理師`, `護士`, `助產士`, `助產師`, `醫事檢驗師`, `醫事檢驗生`, `物理治療師`, `職能治療師`
    , `醫事放射師`, `醫事放射士`, `物理治療生`, `職能治療生`, `呼吸治療師`, `諮商心理師`, `臨床心理師`, `營養師`, `語言治療師`, `牙體技術師`, `聽力師`, `牙體技術生`];
  constructor(private dataService: ClinicMapService, public dialog: MatDialog) { }

  ngOnInit(): void {
    am4core.useTheme(am4themes_animated);
    const chart = am4core.create("chartdiv", am4maps.MapChart);
    chart.zoomControl = new am4maps.ZoomControl();
    chart.geodataSource.url = 'assets/twCounty2010.geo.json';
    chart.projection = new am4maps.projections.Miller();

    const taiwanMapSeries = chart.series.push(new am4maps.MapPolygonSeries());
    taiwanMapSeries.useGeodata = true;
    const taiwanMapTemplate = taiwanMapSeries.mapPolygons.template;
    taiwanMapTemplate.tooltipText = "{name}";
    taiwanMapTemplate.fill = chart.colors.getIndex(0);
    taiwanMapTemplate.nonScalingStroke = true;
    const hs = taiwanMapTemplate.states.create("hover");
    hs.properties.fill = am4core.color("#367B25");

    // const townMapSeries = chart.series.push(new am4maps.MapPolygonSeries());
    // townMapSeries.geodataSource.url = 'assets/twVillage1982_simplify.geo.json';
    // const townMapTemplate = townMapSeries.mapPolygons.template;
    // townMapTemplate.tooltipText = "{name}";
    // townMapTemplate.fill = chart.colors.getIndex(1);
    // townMapTemplate.nonScalingStroke = true;
    // const townHs = townMapTemplate .states.create("hover");
    // townHs.properties.fill = am4core.color("#367B25");

    this.dataService.getCSV()
      .then((data) => {
        this.csvData = data;
      }).then(() => this.addPoint(chart));
    am4core.ready(() => {
    })
  }

  openDialog(detail) {
    const dialogRef = this.dialog.open(ClinicTableComponent, {
      minWidth: '600px',
      minHeight: '400px',
      panelClass: 'dialog-table',
      data: {
        column: this.csvDataMapping,
        detail
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  private addPoint(chart) {
    const targetSVG = "M9,0C4.029,0,0,4.029,0,9s4.029,9,9,9s9-4.029,9-9S13.971,0,9,0z M9,15.93 c-3.83,0-6.93-3.1-6.93-6.93S5.17,2.07,9,2.07s6.93,3.1,6.93,6.93S12.83,15.93,9,15.93 M12.5,9c0,1.933-1.567,3.5-3.5,3.5S5.5,10.933,5.5,9S7.067,5.5,9,5.5 S12.5,7.067,12.5,9z";
    const imageSeries = chart.series.push(new am4maps.MapImageSeries());

    // define template
    var imageSeriesTemplate = imageSeries.mapImages.template;
    const circle = imageSeriesTemplate.createChild(am4core.Sprite);
    circle.scale = 0.4;
    circle.fill = new am4core.InterfaceColorSet().getFor("alternativeBackground");
    circle.path = targetSVG;

    imageSeriesTemplate.propertyFields.latitude = "lat";
    imageSeriesTemplate.propertyFields.longitude = "lng";
    imageSeriesTemplate.propertyFields.detail = "detail";

    imageSeriesTemplate.horizontalCenter = "middle";
    imageSeriesTemplate.verticalCenter = "middle";
    imageSeriesTemplate.align = "center";
    imageSeriesTemplate.valign = "middle";
    imageSeriesTemplate.width = 8;
    imageSeriesTemplate.height = 8;
    imageSeriesTemplate.nonScaling = true;
    imageSeriesTemplate.tooltipText = "{title}";
    imageSeriesTemplate.fill = am4core.color("#000");
    imageSeriesTemplate.background.fillOpacity = 0;
    imageSeriesTemplate.background.fill = am4core.color("#ffffff");
    imageSeriesTemplate.setStateOnChildren = true;
    imageSeriesTemplate.states.create("hover");

    imageSeries.data = this.parseCSVDataToImageData(this.csvData);

    imageSeriesTemplate.events.on("hit", (ev) => {
      console.dir(ev.target.detail);
      this.openDialog(ev.target.detail);
      ev.target.series.chart.zoomToMapObject(ev.target);
    })
  }

  private getCSVIndex(column: string) {
    return this.csvDataMapping.indexOf(column);
  }

  private parseCSVDataToImageData(data: string) {
    const csvData = data.split('\n');
    const imageData = [];
    for (let i = 1; i <= 1000; i++) {
      const csvRawColumn = csvData[i].split(',');
      if(csvRawColumn[8] ==='"') {
        csvRawColumn.splice(8,1);
      }
      const address = csvRawColumn[this.getCSVIndex(`地址`)];
      imageData.push({ title: csvRawColumn[this.getCSVIndex(`機構名稱`)], ...this.dataService.getLatLng(address), detail: csvRawColumn })
    }
    return imageData;
  }
}
