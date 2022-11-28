import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GripCheckboxComponent } from './grip-checkbox.component';

describe('GripCheckboxComponent', () => {
  let component: GripCheckboxComponent;
  let fixture: ComponentFixture<GripCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GripCheckboxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GripCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
