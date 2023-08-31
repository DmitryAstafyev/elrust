import {
    SetupService,
    Interface,
    Implementation,
    register,
    DependOn,
} from 'platform/entity/service';
import { services } from '@register/services';
import { electron } from '@service/electron';
import { Logger } from '@env/logs/index';

import * as Requests from 'platform/ipc/request';
import * as RequestHandlers from './bridge/index';
import * as Events from 'platform/ipc/event';

@DependOn(electron)
@SetupService(services['bridge'])
export class Service extends Implementation {
    protected clientLogger: Logger | undefined = new Logger('Client');

    public override ready(): Promise<void> {
        this.register(
            electron
                .ipc()
                .respondent(
                    this.getName(),
                    Requests.Actions.UrlInBrowser.Request,
                    RequestHandlers.Actions.BrowserUrl.handler,
                ),
        );
        this.register(
            electron
                .ipc()
                .respondent(
                    this.getName(),
                    Requests.App.Version.Request,
                    RequestHandlers.App.Version.handler,
                ),
        );
        this.register(
            electron
                .ipc()
                .respondent(
                    this.getName(),
                    Requests.App.Changelogs.Request,
                    RequestHandlers.App.Changelogs.handler,
                ),
        );
        this.register(
            electron
                .ipc()
                .respondent(
                    this.getName(),
                    Requests.Os.HomeDir.Request,
                    RequestHandlers.Os.HomeDir.handler,
                ),
        );
        this.register(
            Events.IpcEvent.subscribe(Events.Logs.Write.Event, (event: Events.Logs.Write.Event) => {
                this.clientLogger !== undefined &&
                    this.clientLogger.store(event.message, event.level);
            }),
        );
        return Promise.resolve();
    }

    public override destroy(): Promise<void> {
        this.unsubscribe();
        this.clientLogger = undefined;
        return Promise.resolve();
    }
}
export interface Service extends Interface {}
export const bridge = register(new Service());
