import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LibretaPage } from './libreta.page';

const routes: Routes = [
  {
    path: '',
    component: LibretaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LibretaPageRoutingModule {}
