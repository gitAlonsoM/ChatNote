import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InvitationsManagerPage } from './invitations-manager.page';

const routes: Routes = [
  {
    path: '',
    component: InvitationsManagerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvitationsManagerPageRoutingModule {}
