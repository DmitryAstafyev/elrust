import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContainersModule } from '@elements/containers/module';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { AppDirectiviesModule } from '@directives/module';

import { LayoutHome } from './component';

const entryComponents = [LayoutHome];

@NgModule({
    imports: [
        CommonModule,
        ContainersModule,
        MatButtonModule,
        MatCardModule,
        MatDividerModule,
        MatIconModule,
        AppDirectiviesModule,
    ],
    declarations: [...entryComponents],
    exports: [...entryComponents],
    bootstrap: [...entryComponents],
})
export class LayoutHomeModule {}
