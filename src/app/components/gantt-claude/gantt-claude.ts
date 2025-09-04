import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  OnInit,
  signal,
  viewChild,
  ViewChild,
} from '@angular/core';

type Task = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number; // 0-100
  dependencies: string[]; // ID задач, от которых зависит текущая задача | подумать над названием
  color?: string;
};

type TaskKind = 'project' | 'task';

const taskKinds: Record<TaskKind, string> = { project: '#color', task: '#color' };

type TimelineUnit = {
  date: Date;
  label: string;
  isWeekend?: boolean;
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-gantt-claude',
  imports: [CommonModule],
  templateUrl: './gantt-claude.html',
  styleUrl: './gantt-claude.css',
})
export class GanttClaude implements OnInit {
  timelineHeader = viewChild.required<ElementRef>('timelineHeader');
  chartSection = viewChild.required<ElementRef>('chartSection');

  // TODO: поменять структуру - убрать color в отдельный
  tasks: Task[] = [
    {
      id: '1',
      name: 'Планирование проекта',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-07'),
      progress: 100,
      dependencies: [],
      color: '#2196F3',
    },
    {
      id: '2',
      name: 'Анализ требований',
      startDate: new Date('2025-01-08'),
      endDate: new Date('2025-01-15'),
      progress: 85,
      dependencies: ['1'],
      color: '#FF9800',
    },
    {
      id: '3',
      name: 'Дизайн архитектуры',
      startDate: new Date('2025-01-16'),
      endDate: new Date('2025-01-25'),
      progress: 60,
      dependencies: ['2'],
      color: '#9C27B0',
    },
    {
      id: '4',
      name: 'Разработка Frontend',
      startDate: new Date('2025-01-22'),
      endDate: new Date('2025-02-10'),
      progress: 45,
      dependencies: ['3'],
      color: '#4CAF50',
    },
    {
      id: '5',
      name: 'Разработка Backend',
      startDate: new Date('2025-01-29'),
      endDate: new Date('2025-02-15'),
      progress: 30,
      dependencies: ['3'],
      color: '#F44336',
    },
    {
      id: '6',
      name: 'Тестирование',
      startDate: new Date('2025-02-11'),
      endDate: new Date('2025-02-20'),
      progress: 15,
      dependencies: ['4', '5'],
      color: '#607D8B',
    },
    {
      id: '7',
      name: 'Деплой',
      startDate: new Date('2025-02-21'),
      endDate: new Date('2025-02-25'),
      progress: 0,
      dependencies: ['6'],
      color: '#795548',
    },
  ];

  taskIdMap = computed(() => new Map(this.tasks.map((t) => [t.id, t])));

  timeline: TimelineUnit[] = [];
  connections: { path: string }[] = [];

  dayWidth = 40;
  rowHeight = 50;
  chartWidth = 0;
  chartHeight = 0;

  ngOnInit() {
    this.generateTimeline();
    this.calculateDimensions();
    this.generateConnections();
  }

  private generateTimeline() {
    const startDate = new Date(Math.min(...this.tasks.map((t) => t.startDate.getTime())));
    const endDate = new Date(Math.max(...this.tasks.map((t) => t.endDate.getTime())));

    // Добавляем несколько дней до и после для лучшего отображения
    startDate.setDate(startDate.getDate() - 2);
    endDate.setDate(endDate.getDate() + 5);

    const current = new Date(startDate);
    this.timeline = [];

    while (current <= endDate) {
      const isWeekend = current.getDay() === 0 || current.getDay() === 6;

      this.timeline.push({
        date: new Date(current),
        label: current.getDate().toString(),
        isWeekend,
      });

      current.setDate(current.getDate() + 1);
    }
  }

  private calculateDimensions() {
    this.chartWidth = this.timeline.length * this.dayWidth;
    this.chartHeight = this.tasks.length * this.rowHeight;
  }

  private generateConnections() {
    this.connections = [];

    for (const [taskIndex, task] of this.tasks.entries()) {
      for (const depId of task.dependencies) {
        if (!this.taskIdMap().has(depId)) {
          continue;
        }
        const depTask = this.tasks.find((t) => t.id === depId);
        const depIndex = this.tasks.findIndex((t) => t.id === depId);

        if (depTask && depIndex !== -1) {
          const startX = this.getTaskLeft(depTask) + this.getTaskWidth(depTask);
          const startY = depIndex * this.rowHeight + this.rowHeight / 2;
          const endX = this.getTaskLeft(task);
          const endY = taskIndex * this.rowHeight + this.rowHeight / 2;

          // Создаем L-образную линию
          const midX = startX + (endX - startX) / 2;

          const path = `M ${startX},${startY}
                       L ${midX},${startY}
                       L ${midX},${endY}
                       L ${endX - 5},${endY}`;

          this.connections.push({ path });
        }
      }
    }
  }

  getTaskLeft(task: Task): number {
    const startDate = this.timeline[0].date;
    const diffTime = task.startDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays * this.dayWidth);
  }

  getTaskWidth(task: Task): number {
    const diffTime = task.endDate.getTime() - task.startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(20, diffDays * this.dayWidth);
  }

  onTimelineScroll(event: Event) {
    const t = event.target as HTMLElement;
    this.timelineHeader().nativeElement.scrollTo({ left: t.scrollLeft, behavior: 'instant' });
    this.chartSection().nativeElement.scrollTo({ left: t.scrollLeft, behavior: 'instant' });
  }
}
