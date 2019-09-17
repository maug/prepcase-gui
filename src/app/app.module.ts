import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CreateNewcaseComponent } from './create-newcase/create-newcase.component';
import { AppMaterialModule } from "./app-material.module";
import { CreateNewcaseService } from "./create-newcase.service";
import { ReactiveFormsModule } from "@angular/forms";

@NgModule({
  declarations: [
    AppComponent,
    CreateNewcaseComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppMaterialModule,
    ReactiveFormsModule,
  ],
  providers: [CreateNewcaseService],
  bootstrap: [AppComponent]
})
export class AppModule { }
