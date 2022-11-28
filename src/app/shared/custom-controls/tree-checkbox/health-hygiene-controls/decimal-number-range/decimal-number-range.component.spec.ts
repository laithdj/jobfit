import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecimalNumberRangeComponent } from './decimal-number-range.component';

describe('DecimalNumberRangeComponent', () => {
  let component: DecimalNumberRangeComponent;
  let fixture: ComponentFixture<DecimalNumberRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DecimalNumberRangeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DecimalNumberRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
