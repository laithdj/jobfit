import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthHygieneControlsComponent } from './health-hygiene-controls.component';

describe('HealthHygieneControlsComponent', () => {
  let component: HealthHygieneControlsComponent;
  let fixture: ComponentFixture<HealthHygieneControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HealthHygieneControlsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthHygieneControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
