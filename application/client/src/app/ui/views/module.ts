import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarModule } from './toolbar/module';
import { SidebarModule } from './sidebar/module';
import { DialogsModule } from './dialogs/module';

import { ContainersModule } from '@elements/containers/module';

@NgModule({
    imports: [CommonModule, ContainersModule, ToolbarModule, SidebarModule, DialogsModule],
    declarations: [],
    exports: [ToolbarModule, SidebarModule, DialogsModule],
    bootstrap: [ToolbarModule, SidebarModule, DialogsModule],
})
export class ViewsModule {}
