import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CaseService } from './case.service';

@Component({
  selector: 'app-case',
  templateUrl: './case.component.html',
  styleUrls: ['./case.component.scss']
})
export class CaseComponent implements OnInit {

  caseRoot: string;

  caseData: string;

  constructor(private activatedRoute: ActivatedRoute, private dataService: CaseService) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      this.caseRoot = paramMap.get('caseRoot');
      this.dataService.getCaseData(this.caseRoot).subscribe(data => {
        this.caseData = data.stdout;
      });
    });
  }

}
