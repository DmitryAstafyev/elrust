// tslint:disable
import { initLogger } from './logger';
initLogger();
import { Session } from '../src/api/session';
import { finish, runner } from './common';
import { readConfigurationFile } from './config';
import { error } from 'platform/log/utils';

const config = readConfigurationFile().get().tests.errors;

describe('Errors', () => {
    it(config.regular.list[1], function () {
        return runner(config.regular, 1, async (logger, done, collector) => {
            Session.create()
                .then((session: Session) => {
                    session.debug(true, config.regular.list[7]);
                    session.getEvents().SessionDestroyed.subscribe(() => {
                        finish(undefined, done);
                    });
                    session
                        .getNativeSession()
                        .triggerStateError()
                        .catch((err: Error) => {
                            finish(
                                session,
                                done,
                                new Error(`Fail to trigger state error due error: ${error(err)}`),
                            );
                        });
                })
                .catch((err: Error) => {
                    finish(
                        undefined,
                        done,
                        new Error(`Fail to create session due error: ${error(err)}`),
                    );
                });
        });
    });

    it(config.regular.list[2], function () {
        return runner(config.regular, 2, async (logger, done, collector) => {
            Session.create()
                .then((session: Session) => {
                    session.debug(true, config.regular.list[8]);
                    session.getEvents().SessionDestroyed.subscribe(() => {
                        finish(undefined, done);
                    });
                    session
                        .getNativeSession()
                        .triggerTrackerError()
                        .catch((err: Error) => {
                            finish(
                                session,
                                done,
                                new Error(`Fail to trigger tracker error due error: ${error(err)}`),
                            );
                        });
                })
                .catch((err: Error) => {
                    finish(
                        undefined,
                        done,
                        new Error(`Fail to create session due error: ${error(err)}`),
                    );
                });
        });
    });
});
