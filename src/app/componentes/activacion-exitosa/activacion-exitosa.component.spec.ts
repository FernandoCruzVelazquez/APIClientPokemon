import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivacionExitosaComponent } from './activacion-exitosa.component';

describe('ActivacionExitosaComponent', () => {
  let component: ActivacionExitosaComponent;
  let fixture: ComponentFixture<ActivacionExitosaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivacionExitosaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivacionExitosaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
