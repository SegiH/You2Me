import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {MatButtonModule, MatCardModule, MatGridListModule, MatInputModule, MatSnackBarModule, MatStepperModule, MatToolbarModule} from '@angular/material';
import { AppComponent } from './app.component';
import { Y2mComponent } from './y2m/y2m.component';

@NgModule({
     declarations: [
          AppComponent,
          Y2mComponent
     ],
     imports: [
          BrowserModule,
          BrowserAnimationsModule,
          FormsModule,
          MatButtonModule,
          MatCardModule,
          MatGridListModule,
          MatInputModule,
          MatSnackBarModule,
          MatStepperModule,
          MatToolbarModule,
     ],
     providers: [],
     bootstrap: [AppComponent]
})

export class AppModule { }
