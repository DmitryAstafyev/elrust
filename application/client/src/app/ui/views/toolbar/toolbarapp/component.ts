import { Component, ChangeDetectorRef } from '@angular/core';
import { Session } from '@service/session';
import { Ilc, IlcInterface } from '@env/decorators/component';
import { Initial } from '@env/decorators/initial';
import { ChangesDetector } from '@ui/env/extentions/changes';
import { Subscriber } from '@platform/env/subscription';

@Component({
    selector: 'app-views-toolbar-app',
    templateUrl: './template.html',
    styleUrls: ['./styles.less'],
})
@Initial()
@Ilc()
export class ToolbarApp extends ChangesDetector {
    protected session: Session | undefined;
    protected subscriber: Subscriber = new Subscriber();

    constructor(cdRef: ChangeDetectorRef) {
        super(cdRef);
    }
}
export interface ToolbarApp extends IlcInterface {}
