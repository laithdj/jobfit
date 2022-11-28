import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialCheckboxComponent } from './material-checkbox.component';

describe('MaterialCheckboxComponent', () => {
  let component: MaterialCheckboxComponent;
  let fixture: ComponentFixture<MaterialCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaterialCheckboxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
