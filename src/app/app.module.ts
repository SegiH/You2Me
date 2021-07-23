import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreModule } from './core/core.module';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule} from '@angular/forms';
import { SAVER, getSaver } from './core/saver.provider';
import { Y2MComponent } from './y2m/y2m.component';
import { ConfirmDialogComponent } from './confirmdialog/confirmdialog.component';
import {YouTubePlayerModule} from '@angular/youtube-player';
import { OverlayModule } from "@angular/cdk/overlay";
import { YTSearchComponent } from './ytsearch/ytsearch.component';

@NgModule({
     declarations: [
          ConfirmDialogComponent,
          Y2MComponent,
          YTSearchComponent
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
          MatDialogModule,
          MatExpansionModule,
          MatFormFieldModule,
          MatGridListModule,
          MatIconModule,
          MatInputModule,
          MatPaginatorModule,
          MatProgressBarModule,
          MatProgressSpinnerModule,
          MatSelectModule,
          MatSnackBarModule,
          MatSortModule,
          MatTableModule,
          MatToolbarModule,
          OverlayModule,
          ReactiveFormsModule,
          YouTubePlayerModule
     ],
     providers: [{provide: SAVER, useFactory: getSaver} ],
     bootstrap: [Y2MComponent]
})

export class AppModule { }
