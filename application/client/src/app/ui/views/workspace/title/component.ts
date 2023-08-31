import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { Ilc, IlcInterface } from '@env/decorators/component';
import { Session } from '@service/session';
import { ChangesDetector } from '@ui/env/extentions/changes';

@Component({
    selector: 'app-views-workspace-title',
    templateUrl: './template.html',
    styleUrls: ['./styles.less'],
})
@Ilc()
export class ViewWorkspaceTitleComponent extends ChangesDetector {
    @Input() public session!: Session;

    constructor(cdRef: ChangeDetectorRef) {
        super(cdRef);
    }
}
export interface ViewWorkspaceTitleComponent extends IlcInterface {}
