import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarAppModule } from './sidebarapp/module';

@NgModule({
    imports: [CommonModule, ToolbarAppModule],
    declarations: [],
    exports: [ToolbarAppModule],
})
export class SidebarModule {}
