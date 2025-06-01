import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkspaceDetailPage } from './workspace-detail.page';

const routes: Routes = [
  {
    path: '',
    component: WorkspaceDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkspaceDetailPageRoutingModule {}
