import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RecoverKeyPage } from './recover-key.page';

const routes: Routes = [
  {
    path: '',
    component: RecoverKeyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecoverKeyPageRoutingModule {}
