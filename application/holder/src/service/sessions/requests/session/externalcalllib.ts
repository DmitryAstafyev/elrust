import { CancelablePromise } from 'platform/env/promise';
import { sessions } from '@service/sessions';
import { Logger } from 'platform/log';
import { scope } from 'platform/env/scope';

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
                const libPath = scope.getVar<string>('externallibpath');
                if (libPath === undefined) {
                    return reject(new Error(`Path to external lib isn't defined`));
                }
                stored.session
                    .externalCallLib(libPath, request.a, request.b, request.lines)
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
