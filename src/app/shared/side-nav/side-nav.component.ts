import { Component, Input, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent implements OnInit {
  items: MenuItem[] = [];
  @Input() menuList: any;

  constructor() { }

  ngOnInit(): void {
    /*
    this.items = [
      {label: 'Task Details', icon: ''},
      {label: 'Associated Jobs', icon: ''},
      {label: 'Result Setup', icon: ''},
      {label: 'Notes', icon: ''},
      {label: 'Flags', icon: ''},
      {label: 'Groups', icon: ''},
      {label: 'Attachments', icon: ''},
      {label: 'Functional Analysis', icon: ''},
      {label: 'Health and Hygiene', icon: ''},
      {label: 'Environment', icon: ''},
      {label: 'Human Factors ', icon: ''},
      {label: 'Associated Jobs', icon: ''},
  ];*/
  }
}
