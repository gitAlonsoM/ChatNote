import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkspaceRenamePage } from './workspace-rename.page';

const routes: Routes = [
  {
    path: '',
    component: WorkspaceRenamePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkspaceRenamePageRoutingModule {}
