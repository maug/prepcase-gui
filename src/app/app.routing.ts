import { Routes } from '@angular/router';
import { CaseComponent } from './case/case.component';
import { CreateNewcaseComponent } from './create-newcase/create-newcase.component';

export const appRoutes: Routes = [
  { path: 'create-newcase', component: CreateNewcaseComponent },
  { path: 'case/:caseRoot', component: CaseComponent },
  { path: '', redirectTo: '/create-newcase', pathMatch: 'full' },
];
