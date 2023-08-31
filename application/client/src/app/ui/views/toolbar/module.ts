import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarAppModule } from './toolbarapp/module';

@NgModule({
    imports: [CommonModule, ToolbarAppModule],
    declarations: [],
    exports: [],
    bootstrap: [ToolbarAppModule],
})
export class ToolbarModule {}
