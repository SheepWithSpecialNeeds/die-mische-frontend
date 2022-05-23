import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CropSearchComponent } from './crop-search-app.component';

describe('CropComponent', () => {
  let component: CropSearchComponent;
  let fixture: ComponentFixture<CropSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CropSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CropSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
