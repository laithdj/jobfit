import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GripStrengthComponent } from './grip-strength.component';

describe('GripStrengthComponent', () => {
  let component: GripStrengthComponent;
  let fixture: ComponentFixture<GripStrengthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GripStrengthComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GripStrengthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
