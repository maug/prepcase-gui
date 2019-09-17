import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CreateNewcaseComponent } from './create-newcase/create-newcase.component';
import { AppMaterialModule } from "./app-material.module";

@NgModule({
  declarations: [
    AppComponent,
    CreateNewcaseComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppMaterialModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
