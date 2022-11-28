import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialResultComponent } from './material-result.component';

describe('MaterialResultComponent', () => {
  let component: MaterialResultComponent;
  let fixture: ComponentFixture<MaterialResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaterialResultComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
