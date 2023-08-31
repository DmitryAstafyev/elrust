import { CancelablePromise } from 'platform/env/promise';
import { sessions } from '@service/sessions';
import { Logger } from 'platform/log';

import * as Requests from 'platform/ipc/request';

export const handler = Requests.InjectLogger<
    Requests.Session.ExternalCallLib.Request,
    CancelablePromise<Requests.Session.ExternalCallLib.Response>
>(
    (
        _log: Logger,
        request: Requests.Session.ExternalCallLib.Request,
    ): CancelablePromise<Requests.Session.ExternalCallLib.Response> => {
        return new CancelablePromise<Requests.Session.ExternalCallLib.Response>(
            (resolve, reject) => {
                const session_uuid = request.uuid;
                const stored = sessions.get(session_uuid);
                if (stored === undefined) {
                    return reject(new Error(`Session doesn't exist`));
                }
                stored.session
                    .externalCallLib(
                        '/storage/projects/esrlabs/autosar/application/apps/precompiled/plugin/target/release/libplugin.so',
                        request.a,
                        request.b,
                        request.lines,
                    )
                    .then((results) => {
                        return resolve(
                            new Requests.Session.ExternalCallLib.Response({
                                sum: results.sum,
                                found: results.found,
                            }),
                        );
                    })
                    .catch(reject);
            },
        );
    },
);
