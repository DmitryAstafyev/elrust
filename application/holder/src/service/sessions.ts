import {
    SetupService,
    Interface,
    Implementation,
    DependOn,
    register,
} from 'platform/entity/service';
import { electron } from '@service/electron';
import { jobs } from '@service/jobs';
import { services } from '@register/services';
import { Session } from 'rustcore';
import { Active } from './sessions/active';
import { Holder } from './sessions/holder';
import { Subscriber } from 'platform/env/subscription';

import * as RequestHandlers from './sessions/requests';
import * as Requests from 'platform/ipc/request';

export { Jobs } from './sessions/holder';

@DependOn(jobs)
@DependOn(electron)
@SetupService(services['sessions'])
export class Service extends Implementation {
    private _sessions: Map<string, Holder> = new Map();
    private _active: Active = new Active();

    public override ready(): Promise<void> {
        this.register(
            electron
                .ipc()
                .respondent(
                    this.getName(),
                    Requests.Session.Create.Request,
                    RequestHandlers.Session.Create.handler,
                ),
        );
        this.register(
            electron
                .ipc()
                .respondent(
                    this.getName(),
                    Requests.Session.Destroy.Request,
                    RequestHandlers.Session.Destroy.handler,
                ),
        );
        this.register(
            electron
                .ipc()
                .respondent(
                    this.getName(),
                    Requests.Session.ExternalCallLib.Request,
                    RequestHandlers.Session.ExternalCallLib.handler,
                ),
        );
        return Promise.resolve();
    }

    public override destroy(): Promise<void> {
        this.unsubscribe();
        return new Promise((resolve) => {
            Promise.all(
                Array.from(this._sessions.values()).map((session) => {
                    return session.destroy().catch((err: Error) => {
                        this.log().error(
                            `Fail to destroy session ${session.session.getUUID()}; error: ${
                                err.message
                            }`,
                        );
                    });
                }),
            )
                .catch((err: Error) => {
                    this.log().error(`Error during destryoying sessions: ${err.message}`);
                })
                .finally(resolve);
        });
    }

    public add(session: Session, subscriber: Subscriber): Holder {
        const holder = new Holder(session, subscriber);
        this._sessions.set(session.getUUID(), holder);
        return holder;
    }

    public delete(uuid: string) {
        this._sessions.delete(uuid);
    }

    public get(uuid: string): Holder | undefined {
        return this._sessions.get(uuid);
    }

    public setActive(uuid: string) {
        if (!this.exists(uuid)) {
            throw new Error(`Fail to set session ${uuid} active. it doesn't exist`);
        }
        this._active.set(uuid);
    }

    public exists(uuid: string): boolean {
        return this._sessions.has(uuid);
    }
}
export interface Service extends Interface {}
export const sessions = register(new Service());
