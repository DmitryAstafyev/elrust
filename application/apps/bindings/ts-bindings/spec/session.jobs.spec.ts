// tslint:disable

// We need to provide path to TypeScript types definitions
/// <reference path="../node_modules/@types/jasmine/index.d.ts" />
/// <reference path="../node_modules/@types/node/index.d.ts" />

import { initLogger } from './logger';
initLogger();
import { Jobs, Tracker } from '../src/index';
import { readConfigurationFile } from './config';
import { finish, runner } from './common';

import * as os from 'os';

const config = readConfigurationFile().get().tests.jobs;

describe('Jobs', function () {
    it(config.regular.list[1], function () {
        return runner(config.regular, 1, async (logger, done, collector) => {
            const jobs = collector(await Jobs.create()) as Jobs;
            const tracker = collector(await Tracker.create()) as Tracker;
            const operations: Map<string, boolean> = new Map();
            tracker.provider.getEvents().Started.subscribe((event) => {
                operations.set(event.uuid, true);
            });
            tracker.provider.getEvents().Stopped.subscribe((uuid) => {
                operations.set(uuid, false);
            });
            jobs.cancelTest(50, 50)
                .then((a) => {
                    // Job is resolved, but not cancelled
                    expect(a).toBe(100);
                    // Try to cancel job
                    const job = jobs
                        .cancelTest(50, 50)
                        .then((_res) => {
                            expect(operations.size).toBe(2);
                            expect(
                                Array.from(operations.values()).filter(
                                    (running) => running === false,
                                ).length,
                            ).toBe(0);
                            finish(
                                [jobs, tracker],
                                done,
                                new Error(`This job should be cancelled, but not done`),
                            );
                        })
                        .canceled(async () => {
                            finish([jobs, tracker], done);
                        })
                        .catch((err: Error) => {
                            finish([jobs, tracker], done, err);
                        });
                    job.abort();
                })
                .catch((err: Error) => {
                    finish([jobs, tracker], done, err);
                });
        });
    });

    it(config.regular.list[2], function () {
        return runner(config.regular, 2, async (logger, done, collector) => {
            const jobs = collector(await Jobs.create()) as Jobs;
            // Run 2 jobs with same sequence. One of jobs should be failed, because of sequence
            Promise.allSettled([
                jobs.cancelTest(50, 50, 0).asPromise(),
                jobs.cancelTest(50, 50, 0).asPromise(),
            ])
                .then((res) => {
                    if (
                        (res[0].status === 'rejected' && res[1].status === 'rejected') ||
                        (res[0].status !== 'rejected' && res[1].status !== 'rejected')
                    ) {
                        finish(jobs, done, new Error(`Only one task should be rejected`));
                    }
                    expect(
                        res[0].status !== 'rejected'
                            ? res[0].value
                            : res[1].status !== 'rejected'
                            ? res[1].value
                            : undefined,
                    ).toBe(100);
                    finish(jobs, done);
                })
                .catch((err: Error) => {
                    finish(jobs, done, err);
                });
        });
    });
});
