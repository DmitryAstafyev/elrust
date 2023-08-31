import { TabsService, ITabAPI, ETabsListDirection, TabsOptions } from '@elements/tabs/service';
import { Storage } from '@env/storage';
import { SetupLogger, LoggerInterface } from '@platform/entity/logger';
import { cutUuid } from '@log/index';
import { components } from '@env/decorators/initial';
import { Base } from './base';

import * as ids from '@schema/ids';
import * as Requests from '@platform/ipc/request';

@SetupLogger()
export class Session extends Base {
    public readonly storage: Storage = new Storage();

    private _uuid!: string;
    private _tab!: ITabAPI;
    private readonly _toolbar: TabsService = new TabsService();
    private readonly _sidebar: TabsService = new TabsService({
        options: new TabsOptions({ direction: ETabsListDirection.left }),
    });
    protected inited: boolean = false;

    constructor() {
        super();
        this._toolbar.add({
            uuid: ids.TOOLBAR_TAB_SEARCH,
            name: 'Sidebar App',
            active: true,
            closable: false,
            uppercaseTitle: true,
            content: {
                factory: components.get('app-views-sidebar-app'),
                inputs: {
                    session: this,
                },
            },
        });
        this._sidebar.add({
            uuid: ids.SIDEBAR_TAB_FILTERS,
            name: 'Toolbar App',
            active: true,
            closable: false,
            uppercaseTitle: true,
            content: {
                factory: components.get('app-views-toolbar-app'),
                inputs: {
                    session: this,
                },
            },
        });
    }

    public init(): Promise<string> {
        return new Promise((resolve, reject) => {
            Requests.IpcRequest.send<Requests.Session.Create.Response>(
                Requests.Session.Create.Response,
                new Requests.Session.Create.Request({}),
            )
                .then((response) => {
                    this.setLoggerName(`Session: ${cutUuid(response.uuid)}`);
                    this._uuid = response.uuid;
                    this.inited = true;
                    resolve(this._uuid);
                })
                .catch(reject);
        });
    }

    public destroy(): Promise<void> {
        this.storage.destroy();
        this.unsubscribe();
        if (!this.inited) {
            return Promise.resolve();
        }
        return new Promise((resolve) => {
            Requests.IpcRequest.send<Requests.Session.Destroy.Response>(
                Requests.Session.Destroy.Response,
                new Requests.Session.Destroy.Request({ session: this.uuid() }),
            )
                .then((response) => {
                    if (response.error !== undefined) {
                        this.log().error(`Error on destroying session: ${response.error}`);
                    }
                    resolve();
                })
                .catch((err: Error) => {
                    this.log().error(`Error on sending destroy session reques: ${err.message}`);
                    resolve();
                });
        });
    }

    public bind(tab: ITabAPI) {
        this._tab = tab;
    }

    public uuid(): string {
        return this._uuid;
    }

    public sidebar(): TabsService | undefined {
        return this._sidebar;
    }

    public toolbar(): TabsService | undefined {
        return this._toolbar;
    }

    public switch(): {
        toolbar: {
            search(): void;
            presets(): void;
        };
    } {
        return {
            toolbar: {
                search: (): void => {
                    this._toolbar.setActive(ids.TOOLBAR_TAB_SEARCH);
                },
                presets: (): void => {
                    this._toolbar.setActive(ids.TOOLBAR_TAB_PRESET);
                },
            },
        };
    }

    public isBound(): boolean {
        return true;
    }

    public close(): void {
        this._tab.close();
    }

    public title(): {
        set(title: string): Error | undefined;
        get(): Error | string;
    } {
        return {
            set: (title: string): Error | undefined => {
                return this._tab.setTitle(title);
            },
            get: (): Error | string => {
                return this._tab.getTitle();
            },
        };
    }
}
export interface Session extends LoggerInterface {}
