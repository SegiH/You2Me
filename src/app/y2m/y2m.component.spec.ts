import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { Y2MComponent } from './y2m.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DataService } from '../core/data.service';
import { HttpClientModule } from '@angular/common/http';

describe('Y2MComponent', () => {
    let component: Y2MComponent;
    let fixture: ComponentFixture<Y2MComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [Y2MComponent],
            imports: [ 
                BrowserAnimationsModule,
                FormsModule,
                HttpClientModule,
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
            providers: [DataService],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(Y2MComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
