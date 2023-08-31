import { NgModule } from '@angular/core';
import { ResizerDirective } from './resizer';
import { DraggingDirective } from './dragging';
import { ResizeObserverDirective } from './resize.observer';
import { MatDragDropResetFeatureDirective } from './material.dragdrop';

const components = [
    ResizerDirective,
    ResizeObserverDirective,
    DraggingDirective,
    MatDragDropResetFeatureDirective,
];

@NgModule({
    declarations: [...components],
    exports: [...components],
    imports: [],
})
export class AppDirectiviesModule {}
