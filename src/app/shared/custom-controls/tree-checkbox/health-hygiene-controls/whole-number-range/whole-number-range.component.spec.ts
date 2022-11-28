import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WholeNumberRangeComponent } from './whole-number-range.component';

describe('WholeNumberRangeComponent', () => {
  let component: WholeNumberRangeComponent;
  let fixture: ComponentFixture<WholeNumberRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WholeNumberRangeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WholeNumberRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
