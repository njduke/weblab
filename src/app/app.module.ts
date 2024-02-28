import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';


import { AppComponent } from './app.component';
import { CalculatorComponent } from './calculator/calculator.component';


@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgIf
  ],
  declarations: [
    AppComponent,
    CalculatorComponent
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }