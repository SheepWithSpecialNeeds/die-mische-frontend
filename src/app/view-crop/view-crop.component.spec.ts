import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCropComponent } from './view-crop.component';

describe('ViewCropComponent', () => {
  let component: ViewCropComponent;
  let fixture: ComponentFixture<ViewCropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewCropComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
