import { Routes } from '@angular/router';
import { GanttComponent } from './components/gantt-chart/gantt-chart.component';
import { Home } from './components/home/home';
import { GanttClaude } from './components/gantt-claude/gantt-claude';

export const routes: Routes = [
  { path: '', component: Home }, // Главная страница
  { path: 'gantt', component: GanttComponent },
  { path: 'gantt-claude', component: GanttClaude },
  { path: '**', redirectTo: '' },
];
