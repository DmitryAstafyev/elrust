import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarApp } from './component';

const entryComponents = [ToolbarApp];
const components = [...entryComponents];

@NgModule({
    imports: [CommonModule],
    declarations: [...components],
    exports: [...components],
})
export class ToolbarAppModule {}
