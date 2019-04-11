import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatCardModule, MatCheckboxModule, MatGridListModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatSnackBarModule, MatStepperModule, MatToolbarModule } from '@angular/material';
import { Y2mComponent } from './y2m/y2m.component';

@NgModule({
     declarations: [
          Y2mComponent
     ],
     imports: [
          BrowserModule,
          BrowserAnimationsModule,
          FormsModule,
          MatButtonModule,
          MatCardModule,
          MatCheckboxModule,
          MatFormFieldModule,
          MatGridListModule,
          MatInputModule,
          MatSelectModule,
          MatSnackBarModule,
          MatStepperModule,
          MatToolbarModule,
     ],
     providers: [],
     bootstrap: [Y2mComponent]
})

export class AppModule { }
