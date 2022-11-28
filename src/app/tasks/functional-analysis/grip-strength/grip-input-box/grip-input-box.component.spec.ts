import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GripInputBoxComponent } from './grip-input-box.component';

describe('GripInputBoxComponent', () => {
  let component: GripInputBoxComponent;
  let fixture: ComponentFixture<GripInputBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GripInputBoxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GripInputBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
