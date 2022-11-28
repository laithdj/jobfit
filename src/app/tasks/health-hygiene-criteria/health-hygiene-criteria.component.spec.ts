import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthHygieneCriteriaComponent } from './health-hygiene-criteria.component';

describe('HealthHygieneCriteriaComponent', () => {
  let component: HealthHygieneCriteriaComponent;
  let fixture: ComponentFixture<HealthHygieneCriteriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HealthHygieneCriteriaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthHygieneCriteriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
