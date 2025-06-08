import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkspaceFolderPage } from './workspace-folder.page';

const routes: Routes = [
  {
    path: '',
    component: WorkspaceFolderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkspaceFolderPageRoutingModule {}
