import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MatButtonModule,
         MatCardModule,
         MatFormFieldModule,
         MatInputModule,
         MatSnackBarModule,
         MatStepperModule,
         MatToolbarModule
       } from '@angular/material';
import { y2mComponent } from './Y2M.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    y2mComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatStepperModule,
    MatToolbarModule,
  ],
  providers: [],
  bootstrap: [y2mComponent]
})

export class Y2MModule { }
