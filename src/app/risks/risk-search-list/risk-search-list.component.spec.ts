import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RisksSearchListComponent } from './risk-search-list.component';

describe('RisksSearchListComponent', () => {
  let component: RisksSearchListComponent;
  let fixture: ComponentFixture<RisksSearchListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RisksSearchListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RisksSearchListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
