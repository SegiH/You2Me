import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YTSearchComponent } from './ytsearch.component';

describe('YTSearchComponent', () => {
  let component: YTSearchComponent;
  let fixture: ComponentFixture<YTSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ YTSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(YTSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
