import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot, Routes } from '@angular/router';
import { CaseComponent } from './case/case.component';
import { CaseListComponent } from './case-list/case-list.component';
import { CreateNewcaseComponent } from './create-newcase/create-newcase.component';
import { LoginComponent } from './login/login.component';
import { NamelistsComponent } from './namelists/namelists.component';
import { AuthGuard } from './auth/auth.guard';

export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'case-list', component: CaseListComponent, canActivate: [AuthGuard] },
  { path: 'create-newcase', component: CreateNewcaseComponent, canActivate: [AuthGuard] },
  { path: 'case/:caseRoot', component: CaseComponent, canActivate: [AuthGuard] },
  { path: 'namelists/:caseRoot', component: NamelistsComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];

