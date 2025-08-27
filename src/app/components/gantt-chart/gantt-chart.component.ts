import { Component, computed, ElementRef, signal, ViewChild } from '@angular/core';

interface Task {
  id: number;
  name: string;
  start: Date;
  end: Date;
  dependencies?: number[];
}

@Component({
  selector: 'app-gantt',
  standalone: true,
  templateUrl: './gantt-chart.component.html',
  styleUrls: ['./gantt-chart.component.css'],
})
export class GanttComponent {
  @ViewChild('container', { static: true }) container!: ElementRef<HTMLDivElement>;

  dayWidth = 40;

  tasks = signal<Task[]>([
    { id: 1, name: 'Design', start: new Date(2025, 7, 1), end: new Date(2025, 7, 5) },
    {
      id: 2,
      name: 'Development',
      start: new Date(2025, 7, 6),
      end: new Date(2025, 7, 15),
      dependencies: [1],
    },
    {
      id: 3,
      name: 'Testing',
      start: new Date(2025, 7, 16),
      end: new Date(2025, 7, 20),
      dependencies: [2],
    },
  ]);

  minDate = computed(() => new Date(Math.min(...this.tasks().map((t) => t.start.getTime()))));
  maxDate = computed(() => new Date(Math.max(...this.tasks().map((t) => t.end.getTime()))));

  days = computed(() => {
    const diff = (this.maxDate().getTime() - this.minDate().getTime()) / (1000 * 60 * 60 * 24);
    return Array.from({ length: diff + 1 }, (_, i) => {
      const d = new Date(this.minDate());
      d.setDate(this.minDate().getDate() + i);
      return d;
    });
  });

  bars = computed(() =>
    this.tasks().map((t, row) => {
      const startOffset = (t.start.getTime() - this.minDate().getTime()) / (1000 * 60 * 60 * 24);
      const duration = (t.end.getTime() - t.start.getTime()) / (1000 * 60 * 60 * 24);
      return { ...t, row, colStart: startOffset + 1, colEnd: startOffset + duration + 2 };
    })
  );

  connections = signal<{ from: DOMRect; to: DOMRect }[]>([]);

  ngAfterViewInit() {
    this.updateConnections();
  }

  updateConnections() {
    const taskEls = this.container.nativeElement.querySelectorAll('.task');
    const nodes: Record<number, DOMRect> = {};
    taskEls.forEach((el, i) => {
      nodes[this.tasks()[i].id] = el.getBoundingClientRect();
    });

    const conns: { from: DOMRect; to: DOMRect }[] = [];
    this.tasks().forEach((t) => {
      if (t.dependencies) {
        t.dependencies.forEach((dep) => {
          if (nodes[dep] && nodes[t.id]) {
            conns.push({ from: nodes[dep], to: nodes[t.id] });
          }
        });
      }
    });
    this.connections.set(conns);
  }

  trackById(_: number, item: any) {
    return item.id;
  }
}
