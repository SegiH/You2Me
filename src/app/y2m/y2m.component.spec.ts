import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { Y2mComponent } from './y2m.component';
import { MatButtonModule, MatCardModule, MatCheckboxModule, MatGridListModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatSnackBarModule, MatStepperModule, MatToolbarModule } from '@angular/material';
import { DataService } from '../core/data.service';
import { HttpClientModule } from '@angular/common/http';

describe('Y2mComponent', () => {
    let component: Y2mComponent;
    let fixture: ComponentFixture<Y2mComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [Y2mComponent],
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
        fixture = TestBed.createComponent(Y2mComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
