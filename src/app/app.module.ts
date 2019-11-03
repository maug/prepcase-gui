import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CreateNewcaseComponent } from './create-newcase/create-newcase.component';
import { AppMaterialModule } from './app-material.module';
import { CreateNewcaseService, createNewcaseServiceFactory } from './create-newcase.service';
import { ReactiveFormsModule } from '@angular/forms';
import { HelpDialogComponent } from './help-dialog/help-dialog.component';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material';
import { HttpClientModule } from '@angular/common/http';
import { JsonRpcService } from './json-rpc.service';
import { DynamicFormItemComponent } from './dynamic-form/dynamic-form-item/dynamic-form-item.component';
import { EscapeHtmlPipe } from './pipes/keep-html.pipe';
import { appRoutes } from './app.routing';
import { CaseComponent } from './case/case.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    AppComponent,
    CaseComponent,
    CreateNewcaseComponent,
    DynamicFormItemComponent,
    HelpDialogComponent,
    EscapeHtmlPipe,
  ],
  entryComponents: [
    HelpDialogComponent,
  ],
  imports: [
    AppMaterialModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoutes, { enableTracing: false }),
  ],
  providers: [
    CreateNewcaseService,
    JsonRpcService,
    // wait for load as in https://devblog.dymel.pl/2017/10/17/angular-preload/
    { provide: APP_INITIALIZER, useFactory: createNewcaseServiceFactory, deps: [CreateNewcaseService], multi: true }
    // { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: false } },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
