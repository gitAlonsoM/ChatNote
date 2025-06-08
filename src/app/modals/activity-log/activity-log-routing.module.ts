import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ActivityLogPage } from './activity-log.page';

const routes: Routes = [
  {
    path: '',
    component: ActivityLogPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActivityLogPageRoutingModule {}
