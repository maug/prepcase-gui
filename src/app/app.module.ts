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

@NgModule({
  declarations: [
    AppComponent,
    CreateNewcaseComponent,
    HelpDialogComponent,
  ],
  entryComponents: [
    HelpDialogComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppMaterialModule,
    HttpClientModule,
    ReactiveFormsModule,
  ],
  providers: [
    CreateNewcaseService,
    { provide: APP_INITIALIZER, useFactory: createNewcaseServiceFactory, deps: [CreateNewcaseService], multi: true }
    // { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: false } },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
