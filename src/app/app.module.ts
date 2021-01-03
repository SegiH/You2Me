import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreModule } from './core/core.module';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'
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
import { NgModule } from '@angular/core';
import { ReactiveFormsModule} from '@angular/forms';
import { SAVER, getSaver } from './core/saver.provider';
import { Y2MComponent } from './y2m/y2m.component';

@NgModule({
     declarations: [
          Y2MComponent
     ],
     imports: [
          BrowserModule,
          BrowserAnimationsModule,
          CoreModule,
          FormsModule,
          HttpClientModule,
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
          ReactiveFormsModule
     ],
     providers: [{provide: SAVER, useFactory: getSaver}],
     bootstrap: [Y2MComponent]
})

export class AppModule { }
