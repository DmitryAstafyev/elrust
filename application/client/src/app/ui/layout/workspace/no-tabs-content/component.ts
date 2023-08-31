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

    public create(): void {
        this.ilc()
            .services.system.session.add(true)
            .empty()
            .then((session) => {
                this.log().debug(`Session ${session.uuid()} has been created`);
            })
            .catch((err: Error) => {
                this.log().error(`Fail to create a session due: ${err.message}`);
            });
    }
}
export interface LayoutHome extends IlcInterface {}
