import { CancelablePromise } from 'platform/env/promise';
import { Session } from 'rustcore';
import { sessions } from '@service/sessions';
import { Subscriber } from 'platform/env/subscription';
import { Logger } from 'platform/log';

// import * as Events from 'platform/ipc/event';
import * as Requests from 'platform/ipc/request';

export const handler = Requests.InjectLogger<
    Requests.Session.Create.Request,
    CancelablePromise<Requests.Session.Create.Response>
>(
    (
        log: Logger,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        request: Requests.Session.Create.Request,
    ): CancelablePromise<Requests.Session.Create.Response> => {
        return new CancelablePromise((resolve, reject) => {
            Session.create()
                .then((session: Session) => {
                    const uuid = session.getUUID();
                    const subscriber = new Subscriber();
                    sessions.add(session, subscriber);
                    sessions.setActive(uuid);
                    resolve(
                        new Requests.Session.Create.Response({
                            uuid: uuid,
                        }),
                    );
                })
                .catch((err: Error) => {
                    log.error(`Fail to create session: ${err.message}`);
                    reject(new Error(`Fail to create session`));
                });
        });
    },
);
