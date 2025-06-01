import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkspaceCreatePage } from './workspace-create.page';

const routes: Routes = [
  {
    path: '',
    component: WorkspaceCreatePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkspaceCreatePageRoutingModule {}
