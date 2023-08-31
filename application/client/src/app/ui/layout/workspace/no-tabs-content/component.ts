import { Component, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { Ilc, IlcInterface } from '@env/decorators/component';
import { ChangesDetector } from '@ui/env/extentions/changes';

@Component({
    selector: 'app-layout-area-no-tabs-content',
    templateUrl: './template.html',
    styleUrls: ['./styles.less'],
    encapsulation: ViewEncapsulation.None,
})
@Ilc()
export class LayoutHome extends ChangesDetector {
    constructor(cdRef: ChangeDetectorRef) {
        super(cdRef);
    }
}
export interface LayoutHome extends IlcInterface {}
