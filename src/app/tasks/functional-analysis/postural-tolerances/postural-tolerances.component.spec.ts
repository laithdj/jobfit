import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosturalTolerancesComponent } from './postural-tolerances.component';

describe('PosturalTolerancesComponent', () => {
  let component: PosturalTolerancesComponent;
  let fixture: ComponentFixture<PosturalTolerancesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PosturalTolerancesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PosturalTolerancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
