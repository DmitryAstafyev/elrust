import { SetupService, Interface, Implementation, register } from '@platform/entity/service';
import { services } from '@register/services';
import { Entry } from '@platform/types/storage/entry';

import * as Requests from '@platform/ipc/request/index';

@SetupService(services['bridge'])
export class Service extends Implementation {
    public override ready(): Promise<void> {
        return Promise.resolve();
    }

    public storage(key: string): {
        write(content: string): Promise<void>;
        read(): Promise<string>;
    } {
        return {
            write: (content: string): Promise<void> => {
                return new Promise((resolve, reject) => {
                    Requests.IpcRequest.send(
                        Requests.Storage.Write.Response,
                        new Requests.Storage.Write.Request({
                            key,
                            content,
                        }),
                    )
                        .then(() => {
                            resolve(undefined);
                        })
                        .catch(reject);
                });
            },
            read: (): Promise<string> => {
                return new Promise((resolve, reject) => {
                    Requests.IpcRequest.send(
                        Requests.Storage.Read.Response,
                        new Requests.Storage.Read.Request({
                            key,
                        }),
                    )
                        .then((response) => {
                            resolve(response.content);
                        })
                        .catch(reject);
                });
            },
        };
    }

    public brower(): {
        url(url: string): Promise<void>;
    } {
        return {
            url: (url: string): Promise<void> => {
                return new Promise((resolve, reject) => {
                    Requests.IpcRequest.send(
                        Requests.Actions.UrlInBrowser.Response,
                        new Requests.Actions.UrlInBrowser.Request({ url }),
                    )
                        .then((_response) => {
                            resolve();
                        })
                        .catch(reject);
                });
            },
        };
    }

    public cwd(): {
        set(uuid: string | undefined, path: string): Promise<void>;
        get(uuid: string | undefined): Promise<string>;
    } {
        return {
            set: (uuid: string | undefined, path: string): Promise<void> => {
                return new Promise((resolve, reject) => {
                    Requests.IpcRequest.send(
                        Requests.Cwd.Set.Response,
                        new Requests.Cwd.Set.Request({
                            uuid,
                            cwd: path,
                        }),
                    )
                        .then((response) => {
                            if (response.error !== undefined) {
                                return reject(new Error(response.error));
                            }
                            resolve(undefined);
                        })
                        .catch(reject);
                });
            },
            get: (uuid: string | undefined): Promise<string> => {
                return new Promise((resolve, reject) => {
                    Requests.IpcRequest.send(
                        Requests.Cwd.Get.Response,
                        new Requests.Cwd.Get.Request({
                            uuid,
                        }),
                    )
                        .then((response) => {
                            resolve(response.cwd);
                        })
                        .catch(reject);
                });
            },
        };
    }

    public os(): {
        homedir(): Promise<string>;
    } {
        return {
            homedir: (): Promise<string> => {
                return new Promise((resolve, reject) => {
                    Requests.IpcRequest.send(
                        Requests.Os.HomeDir.Response,
                        new Requests.Os.HomeDir.Request(),
                    )
                        .then((response) => {
                            resolve(response.path);
                        })
                        .catch(reject);
                });
            },
        };
    }

    public env(): {
        inject(envs: { [key: string]: string }): Promise<void>;
        get(): Promise<{ [key: string]: string }>;
    } {
        return {
            inject: (env: { [key: string]: string }): Promise<void> => {
                return new Promise((resolve, reject) => {
                    Requests.IpcRequest.send(
                        Requests.Env.Set.Response,
                        new Requests.Env.Set.Request({
                            env,
                        }),
                    )
                        .then((response) => {
                            if (response.error !== undefined) {
                                return reject(new Error(response.error));
                            }
                            resolve(undefined);
                        })
                        .catch(reject);
                });
            },
            get: (): Promise<{ [key: string]: string }> => {
                return new Promise((resolve, reject) => {
                    Requests.IpcRequest.send(
                        Requests.Env.Get.Response,
                        new Requests.Env.Get.Request(),
                    )
                        .then((response) => {
                            resolve(response.env);
                        })
                        .catch(reject);
                });
            },
        };
    }

    public app(): {
        version(): Promise<string>;
        changelogs(version?: string): Promise<{ markdown: string; version: string }>;
    } {
        return {
            version: (): Promise<string> => {
                return new Promise((resolve, reject) => {
                    Requests.IpcRequest.send(
                        Requests.App.Version.Response,
                        new Requests.App.Version.Request(),
                    )
                        .then((response) => {
                            if (response.error !== undefined) {
                                return reject(new Error(response.error));
                            }
                            resolve(response.version);
                        })
                        .catch(reject);
                });
            },
            changelogs: (version?: string): Promise<{ markdown: string; version: string }> => {
                return new Promise((resolve, reject) => {
                    Requests.IpcRequest.send(
                        Requests.App.Changelogs.Response,
                        new Requests.App.Changelogs.Request({ version }),
                    )
                        .then((response) => {
                            if (response.error !== undefined) {
                                return reject(new Error(response.error));
                            }
                            resolve({ markdown: response.markdown, version: response.version });
                        })
                        .catch(reject);
                });
            },
        };
    }

    public entries(dest: { key?: string; file?: string }): {
        get(): Promise<Entry[]>;
        /**
         * Updates existed and inserts new entries
         * @param entries entries to be updated or inserted. If entry already exist, it will be updated with given
         * @returns
         */
        update(entries: Entry[]): Promise<void>;
        /**
         * Inserts new entries without updating existed
         * @param entries entries to be inserted. If entry already exist, it will be ignored
         * @returns
         */
        append(entries: Entry[]): Promise<void>;
        /**
         * Clean storage (remove all existed entries) and set with given entries
         * @param entries entries to be inserted.
         * @returns
         */
        overwrite(entries: Entry[]): Promise<void>;
        /**
         * Removes given entries
         * @param uuids list of uuids of entries to be removed
         * @returns
         */
        delete(uuids: string[]): Promise<void>;
    } {
        const set = (
            dest: { key?: string; file?: string },
            entries: Entry[],
            mode: 'overwrite' | 'update' | 'append',
        ): Promise<undefined> => {
            return new Promise((resolve, reject) => {
                Requests.IpcRequest.send(
                    Requests.Storage.EntriesSet.Response,
                    new Requests.Storage.EntriesSet.Request({
                        key: dest.key,
                        file: dest.file,
                        entries,
                        mode,
                    }),
                )
                    .then(() => {
                        resolve(undefined);
                    })
                    .catch(reject);
            });
        };
        return {
            get: (): Promise<Entry[]> => {
                return new Promise((resolve, reject) => {
                    Requests.IpcRequest.send(
                        Requests.Storage.EntriesGet.Response,
                        new Requests.Storage.EntriesGet.Request({
                            key: dest.key,
                            file: dest.file,
                        }),
                    )
                        .then((response) => {
                            resolve(response.entries);
                        })
                        .catch(reject);
                });
            },
            update: (entries: Entry[]): Promise<void> => {
                return set(dest, entries, 'update');
            },
            overwrite: (entries: Entry[]): Promise<void> => {
                return set(dest, entries, 'overwrite');
            },
            append: (entries: Entry[]): Promise<void> => {
                return set(dest, entries, 'append');
            },
            delete: (uuids: string[]): Promise<void> => {
                if (dest.key === undefined) {
                    return Promise.reject(
                        new Error(`Delete functionality is available only for internal storages`),
                    );
                }
                const key = dest.key;
                return new Promise((resolve, reject) => {
                    Requests.IpcRequest.send(
                        Requests.Storage.EntriesDelete.Response,
                        new Requests.Storage.EntriesDelete.Request({
                            key,
                            uuids,
                        }),
                    )
                        .then(() => {
                            resolve(undefined);
                        })
                        .catch(reject);
                });
            },
        };
    }
}
export interface Service extends Interface {}
export const bridge = register(new Service());
