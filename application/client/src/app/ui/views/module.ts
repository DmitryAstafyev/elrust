import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarModule } from './toolbar/module';
import { SidebarModule } from './sidebar/module';
import { DialogsModule } from './dialogs/module';
import { WorkspaceModule } from './workspace/module';

import { ContainersModule } from '@elements/containers/module';

@NgModule({
    imports: [
        CommonModule,
        ContainersModule,
        ToolbarModule,
        SidebarModule,
        DialogsModule,
        WorkspaceModule,
    ],
    declarations: [],
    exports: [ToolbarModule, SidebarModule, DialogsModule, WorkspaceModule],
    bootstrap: [ToolbarModule, SidebarModule, DialogsModule, WorkspaceModule],
})
export class ViewsModule {}
