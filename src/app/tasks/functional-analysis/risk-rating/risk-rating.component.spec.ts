import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskRatingComponent } from './risk-rating.component';

describe('RiskRatingComponent', () => {
  let component: RiskRatingComponent;
  let fixture: ComponentFixture<RiskRatingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RiskRatingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskRatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
