import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecimalNumberComponent } from './decimal-number.component';

describe('DecimalNumberComponent', () => {
  let component: DecimalNumberComponent;
  let fixture: ComponentFixture<DecimalNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DecimalNumberComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DecimalNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
