import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalJobComponent } from './modal-job.component';

describe('ModalTaskComponent', () => {
  let component: ModalJobComponent;
  let fixture: ComponentFixture<ModalJobComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalJobComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
