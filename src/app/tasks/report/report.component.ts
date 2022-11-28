import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
  reportType: string = '';

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe((params: Params) => {
      this.reportType = params?.taskId;
    }); 
   }

  ngOnInit(): void {
  }

}
