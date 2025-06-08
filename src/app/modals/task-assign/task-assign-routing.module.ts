//src\app\modals\task-assign\task-assign-routing.module.ts
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TaskAssignPage } from './task-assign.page';

const routes: Routes = [
  {
    path: '',
    component: TaskAssignPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TaskAssignPageRoutingModule {}