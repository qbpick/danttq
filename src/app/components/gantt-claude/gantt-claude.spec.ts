import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GanttClaude } from './gantt-claude';

describe('GanttClaude', () => {
  let component: GanttClaude;
  let fixture: ComponentFixture<GanttClaude>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GanttClaude]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GanttClaude);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
