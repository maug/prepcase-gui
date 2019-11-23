import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot, Routes } from '@angular/router';
import { CaseComponent } from './case/case.component';
import { CaseListComponent } from './case-list/case-list.component';
import { CreateNewcaseComponent } from './create-newcase/create-newcase.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth/auth.guard';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateNewcaseService } from './create-newcase/create-newcase.service';

@Injectable({ providedIn: 'root' })
export class CreateNewcaseResolver implements Resolve<any> {
  constructor(private service: CreateNewcaseService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any>|Promise<any>|any {
    return this.service.loadData();
  }
}

export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'case-list', component: CaseListComponent, canActivate: [AuthGuard] },
  { path: 'create-newcase', component: CreateNewcaseComponent, canActivate: [AuthGuard], resolve: { data: CreateNewcaseResolver } },
  { path: 'case/:caseRoot', component: CaseComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];

