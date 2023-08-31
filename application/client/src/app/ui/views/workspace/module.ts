import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewWorkspace } from './component';
import { ViewWorkspaceTitleComponent } from './title/component';
import { ContainersModule } from '@elements/containers/module';

const entryComponents = [ViewWorkspace, ViewWorkspaceTitleComponent];
const components = [ViewWorkspace, ...entryComponents];

@NgModule({
    imports: [CommonModule, ContainersModule],
    declarations: [...components],
    exports: [...components],
})
export class WorkspaceModule {}
