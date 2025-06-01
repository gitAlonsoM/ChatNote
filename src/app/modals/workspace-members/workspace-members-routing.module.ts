import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkspaceMembersPage } from './workspace-members.page';

const routes: Routes = [
  {
    path: '',
    component: WorkspaceMembersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkspaceMembersPageRoutingModule {}
