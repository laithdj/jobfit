import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';

@Component({
  selector: 'app-base-app',
  templateUrl: './base-app.component.html',
  styleUrls: ['./base-app.component.css']
})
export class BaseAppComponent implements OnInit {
  username:string | undefined = '';

  constructor(private appUiStore: Store<any>) { }

  ngOnInit(): void {
  }

  onToggleEdit() {
  }
}
