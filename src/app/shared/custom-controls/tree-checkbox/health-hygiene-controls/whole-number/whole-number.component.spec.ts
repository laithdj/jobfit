import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WholeNumberComponent } from './whole-number.component';

describe('WholeNumberComponent', () => {
  let component: WholeNumberComponent;
  let fixture: ComponentFixture<WholeNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WholeNumberComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WholeNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
