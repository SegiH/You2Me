import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatCardModule, MatCheckboxModule, MatDividerModule, MatGridListModule, MatInputModule, MatFormFieldModule, MatPaginatorModule, MatSelectModule, MatSnackBarModule, MatSortModule, MatStepperModule, MatTableModule, MatToolbarModule } from '@angular/material';
import { Y2mComponent } from './y2m/y2m.component';
import { CoreModule } from './core/core.module';

@NgModule({
     declarations: [
          Y2mComponent
     ],
     imports: [
          BrowserModule,
          BrowserAnimationsModule,
          CoreModule,
          FormsModule,
          MatButtonModule,
          MatCardModule,
          MatCheckboxModule,
          MatDividerModule,
          MatFormFieldModule,
          MatGridListModule,
          MatInputModule,
          MatPaginatorModule,
          MatSelectModule,
          MatSnackBarModule,
          MatSortModule,
          MatStepperModule,
          MatTableModule,
          MatToolbarModule,
     ],
     providers: [],
     bootstrap: [Y2mComponent]
})

export class AppModule { }
