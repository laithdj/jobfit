import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialHandlingComponent } from './material-handling.component';

describe('MaterialHandlingComponent', () => {
  let component: MaterialHandlingComponent;
  let fixture: ComponentFixture<MaterialHandlingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaterialHandlingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialHandlingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
