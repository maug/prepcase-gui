import { Routes } from '@angular/router'
import { CaseComponent } from './case/case.component'
import { CaseListComponent } from './case-list/case-list.component'
import { ScriptsComponent } from './scripts/scripts.component'
import { CreateNewcaseComponent } from './create-newcase/create-newcase.component'
import { LoginComponent } from './login/login.component'
import { NamelistsComponent } from './namelists/namelists.component'
import { SuitesComponent } from './suites/suites.component'
import { SuiteComponent } from './suite/suite.component'
import { AuthGuard } from './auth/auth.guard'

export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'case-list', component: CaseListComponent, canActivate: [AuthGuard] },
  { path: 'scripts', component: ScriptsComponent, canActivate: [AuthGuard] },
  { path: 'create-newcase', component: CreateNewcaseComponent, canActivate: [AuthGuard] },
  { path: 'case/:caseRoot', component: CaseComponent, canActivate: [AuthGuard] },
  { path: 'namelists/:caseRoot', component: NamelistsComponent, canActivate: [AuthGuard] },
  { path: 'namelists-multi/:multiRoot', component: NamelistsComponent, canActivate: [AuthGuard] },
  { path: 'suites', component: SuitesComponent, canActivate: [AuthGuard] },
  { path: 'suite/:suiteRoot', component: SuiteComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
]
