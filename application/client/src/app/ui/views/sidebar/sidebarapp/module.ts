import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarApp } from './component';

const entryComponents = [SidebarApp];
const components = [...entryComponents];

@NgModule({
    imports: [CommonModule],
    declarations: [...components],
    exports: [...components],
})
export class ToolbarAppModule {}
