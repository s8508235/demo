import { Component, OnInit } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private overlayContainer: OverlayContainer){}
  title = 'map-with-clinic-data';
  ngOnInit() {
    this.overlayContainer.getContainerElement().classList.add('theme-one');
  }
}
