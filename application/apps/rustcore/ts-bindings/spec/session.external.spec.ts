// tslint:disable

// We need to provide path to TypeScript types definitions
/// <reference path="../node_modules/@types/jasmine/index.d.ts" />
/// <reference path="../node_modules/@types/node/index.d.ts" />
import { initLogger } from './logger';
initLogger();
import { Session } from '../src/api/session';
import { finish, runner } from './common';
import { readConfigurationFile } from './config';

const config = readConfigurationFile().get().tests.external;

describe('External', function () {
    it(config.regular.list[1], function () {
        return runner(config.regular, 1, async (logger, done, collector) => {
            Session.create()
                .then((session: Session) => {
                    session.debug(true, config.regular.list[1]);
                    session
                        .externalCallLib(config.regular.files['lib'], 2, 6, ['one', 'two', 'three'])
                        .then((result) => {
                            console.log(result);
                            finish(session, done, undefined);
                        })
                        .catch((err: Error) => {
                            finish(session, done, err);
                        });
                })
                .catch((err: Error) => {
                    finish(
                        undefined,
                        done,
                        new Error(
                            `Fail to create session due error: ${
                                err instanceof Error ? err.message : err
                            }`,
                        ),
                    );
                });
        });
    });
});
