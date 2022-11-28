import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthHygieneComponent } from './health-hygiene.component';

describe('HealthHygeineComponent', () => {
  let component: HealthHygieneComponent;
  let fixture: ComponentFixture<HealthHygieneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HealthHygieneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthHygieneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
