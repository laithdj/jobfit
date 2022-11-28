import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RisksSearchComponent } from './risks-search.component';

describe('RisksSearchComponent', () => {
  let component: RisksSearchComponent;
  let fixture: ComponentFixture<RisksSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RisksSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RisksSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
