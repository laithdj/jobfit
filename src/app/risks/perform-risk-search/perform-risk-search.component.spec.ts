import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformRisksSearchComponent } from './perform-risk-search.component';

describe('PerformRisksSearchComponent', () => {
  let component: PerformRisksSearchComponent;
  let fixture: ComponentFixture<PerformRisksSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PerformRisksSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PerformRisksSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
