import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Item } from './component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AppDirectiviesModule } from '@directives/module';

const entryComponents = [
    Item,

];
const components = [...entryComponents];

@NgModule({
    imports: [CommonModule, MatButtonModule, MatIconModule, AppDirectiviesModule],
    declarations: [...components],
    exports: [...components],
})
export class ItemModule {}
