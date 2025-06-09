/* src\app\modals\my-tasks\my-tasks.module.ts */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MyTasksPage } from './my-tasks.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  declarations: [MyTasksPage]
})
export class MyTasksPageModule {}
