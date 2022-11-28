import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HumanFactorsComponent } from './human-factors.component';

describe('HumanFactorsComponent', () => {
  let component: HumanFactorsComponent;
  let fixture: ComponentFixture<HumanFactorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HumanFactorsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HumanFactorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
