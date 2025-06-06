import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkspaceInvitePage } from './workspace-invite.page';

const routes: Routes = [
  {
    path: '',
    component: WorkspaceInvitePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkspaceInvitePageRoutingModule {}
