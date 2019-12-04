import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
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
