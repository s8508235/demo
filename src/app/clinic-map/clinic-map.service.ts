import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Location {
  lat: string;
  lng: string;
}
@Injectable({
  providedIn: 'root'
})
export class ClinicMapService {
  readonly csvURL = `assets/醫療機構與人員基本資料20190131.csv`;
  readonly encodingURL = `assets/geoEncoding1000.json`;
  private locationMap: Map<string, Location>;
  constructor(private http: HttpClient) {
    this.locationMap = new Map<string, Location>();
    this.getLocation().then(locationMap => {
      Object.keys(locationMap).map((key) => {
        this.locationMap.set(key, locationMap[key]);
      })
    });
  }

  getCSV(): Promise<string> {
    return this.http.get(this.csvURL, { responseType: 'text' }).toPromise();
  }

  getLatLng(address: string): Location {
    return this.locationMap.get(address);
  }

  private getLocation(): Promise<object> {
    return this.http.get(this.encodingURL, { responseType: 'json' }).toPromise();
  }
}
