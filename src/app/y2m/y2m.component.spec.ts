import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Y2mComponent } from './y2m.component';
import { MatToolbarModule } from '@angular/material';
import { NgModule } from '@angular/core';

describe('Y2mComponent', () => {
    let component: Y2mComponent;
    let fixture: ComponentFixture<Y2mComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [Y2mComponent],
            imports: [ MatToolbarModule ],
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
