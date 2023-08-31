import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { Session } from '@service/session';
import { Ilc, IlcInterface } from '@env/decorators/component';
import { Initial } from '@env/decorators/initial';
import { ChangesDetector } from '@ui/env/extentions/changes';

@Component({
    selector: 'app-views-workspace',
    templateUrl: './template.html',
    styleUrls: ['./styles.less'],
})
@Initial()
@Ilc()
export class ViewWorkspace extends ChangesDetector {
    @Input() public session!: Session;
    public sum: number | undefined;
    public found: string | undefined;

    constructor(cdRef: ChangeDetectorRef) {
        super(cdRef);
    }

    public externalCallLib() {
        this.session
            .externalCallLib(2, 6, ['one', 'two', 'three'])
            .then((result) => {
                this.sum = result.sum;
                this.found = result.found;
                this.detectChanges();
            })
            .catch((err: Error) => {
                this.log().error(err.message);
            });
    }
}
export interface ViewWorkspace extends IlcInterface {}
