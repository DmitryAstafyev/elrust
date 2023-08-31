import { SetupService, Interface, Implementation, register } from '@platform/entity/service';
import { services } from '@register/services';
import { api } from '@service/api';
import { CancelablePromise } from '@platform/env/promise';

import * as Requests from '@platform/ipc/request';
import * as handlers from '@service/actions/index';

@SetupService(services['actions'])
export class Service extends Implementation {
    public override ready(): Promise<void> {
        this.register(
            api
                .transport()
                .respondent(
                    this.getName(),
                    Requests.Actions.About.Request,
                    (
                        _request: Requests.Actions.About.Request,
                    ): CancelablePromise<Requests.Actions.About.Response> => {
                        return new CancelablePromise((resolve, _reject) => {
                            new handlers.About.Action()
                                .apply()
                                .catch((err: Error) => {
                                    this.log().error(`Fail to call About action: ${err.message}`);
                                })
                                .finally(() => {
                                    resolve(new Requests.Actions.About.Response());
                                });
                        });
                    },
                ),
        );
        this.register(
            api
                .transport()
                .respondent(
                    this.getName(),
                    Requests.Actions.Updates.Request,
                    (
                        _request: Requests.Actions.Updates.Request,
                    ): CancelablePromise<Requests.Actions.Updates.Response> => {
                        return new CancelablePromise((resolve, _reject) => {
                            new handlers.Updates.Action()
                                .apply()
                                .catch((err: Error) => {
                                    this.log().error(`Fail to call Updates action: ${err.message}`);
                                })
                                .finally(() => {
                                    resolve(new Requests.Actions.Updates.Response());
                                });
                        });
                    },
                ),
        );
        this.register(
            api
                .transport()
                .respondent(
                    this.getName(),
                    Requests.Actions.Settings.Request,
                    (
                        _request: Requests.Actions.Settings.Request,
                    ): CancelablePromise<Requests.Actions.Settings.Response> => {
                        return new CancelablePromise((resolve, _reject) => {
                            new handlers.Settings.Action()
                                .apply()
                                .catch((err: Error) => {
                                    this.log().error(
                                        `Fail to call Settings action: ${err.message}`,
                                    );
                                })
                                .finally(() => {
                                    resolve(new Requests.Actions.Settings.Response());
                                });
                        });
                    },
                ),
        );
        this.register(
            api
                .transport()
                .respondent(
                    this.getName(),
                    Requests.Actions.Help.Request,
                    (
                        _request: Requests.Actions.Help.Request,
                    ): CancelablePromise<Requests.Actions.Help.Response> => {
                        return new CancelablePromise((resolve, _reject) => {
                            new handlers.Help.Action()
                                .apply()
                                .catch((err: Error) => {
                                    this.log().error(`Fail to call Help action: ${err.message}`);
                                })
                                .finally(() => {
                                    resolve(new Requests.Actions.Help.Response());
                                });
                        });
                    },
                ),
        );
        return Promise.resolve();
    }
}
export interface Service extends Interface {}
export const actions = register(new Service());
