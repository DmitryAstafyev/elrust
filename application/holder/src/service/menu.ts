import {
    SetupService,
    Interface,
    Implementation,
    register,
    DependOn,
} from 'platform/entity/service';
import { services } from '@register/services';
import { cli } from '@service/cli';
import { Menu, MenuItem } from 'electron';
import { notifications } from '@service/notifications';
import { unique } from 'platform/env/sequence';
import { ElrustGlobal } from '@register/global';

import * as Actions from './actions';

declare const global: ElrustGlobal;

@DependOn(notifications)
@DependOn(cli)
@SetupService(services['menu'])
export class Service extends Implementation {
    protected readonly isMac: boolean = process.platform === 'darwin';

    public override ready(): Promise<void> {
        this.update().catch((err: Error) => {
            this.log().error(`Fail to update/init application menu: ${err.message}`);
        });
        return Promise.resolve();
    }

    public async update(): Promise<void> {
        const menu = Menu.buildFromTemplate(await this.generate());
        Menu.setApplicationMenu(menu);
    }

    protected async generate(): Promise<MenuItem[]> {
        return [
            ...(this.isMac
                ? [
                      {
                          label: `Elrust`,
                          submenu: [
                              { role: 'services' },
                              { type: 'separator' },
                              { role: 'hide' },
                              { role: 'hideOthers' },
                              { role: 'unhide' },
                              { type: 'separator' },
                              {
                                  label: 'Settings',
                                  submenu: [
                                      {
                                          label: 'Settings',
                                          click: async () => {
                                              Actions.settings().catch((err: Error) => {
                                                  this.log().error(
                                                      `Fail call action Settings: ${err.message}`,
                                                  );
                                              });
                                          },
                                      },
                                  ],
                              },
                              { type: 'separator' },
                              {
                                  label: 'Check for updates',
                                  click: async () => {
                                      Actions.updates().catch((err: Error) => {
                                          this.log().error(
                                              `Fail call action Updates: ${err.message}`,
                                          );
                                      });
                                  },
                              },
                              { type: 'separator' },
                              {
                                  label: 'Help / Documentation',
                                  click: async () => {
                                      Actions.help().catch((err: Error) => {
                                          this.log().error(`Fail call action Help: ${err.message}`);
                                      });
                                  },
                              },
                              {
                                  label: 'About',
                                  click: async () => {
                                      Actions.about().catch((err: Error) => {
                                          this.log().error(
                                              `Fail call action About: ${err.message}`,
                                          );
                                      });
                                  },
                              },
                              { type: 'separator' },
                              {
                                  label: 'Developing',
                                  submenu: [
                                      { role: 'reload' },
                                      { role: 'forceReload' },
                                      { role: 'toggleDevTools' },
                                  ],
                              },

                              { type: 'separator' },
                              {
                                  label: this.isMac ? 'Quit' : 'Close',
                                  registerAccelerator: false,
                                  accelerator: 'CommandOrControl + Q',
                                  click: () => {
                                      global.application
                                          .shutdown('ClosingWithMenu')
                                          .close()
                                          .catch((err: Error) => {
                                              this.log().error(`Fail to close: ${err.message}`);
                                          });
                                  },
                              },
                          ],
                      },
                  ]
                : []),
            ...(!this.isMac
                ? [
                      {
                          label: `Elrust`,
                          submenu: [
                              {
                                  label: 'Settings',
                                  submenu: [
                                      {
                                          label: 'Settings',
                                          click: async () => {
                                              Actions.settings().catch((err: Error) => {
                                                  this.log().error(
                                                      `Fail call action Settings: ${err.message}`,
                                                  );
                                              });
                                          },
                                      },
                                  ],
                              },
                              { type: 'separator' },
                              {
                                  label: 'Check for updates',
                                  click: async () => {
                                      Actions.updates().catch((err: Error) => {
                                          this.log().error(
                                              `Fail call action Updates: ${err.message}`,
                                          );
                                      });
                                  },
                              },
                              { type: 'separator' },
                              {
                                  label: 'Help / Documentation',
                                  click: async () => {
                                      Actions.help().catch((err: Error) => {
                                          this.log().error(`Fail call action Help: ${err.message}`);
                                      });
                                  },
                              },
                              {
                                  label: 'About',
                                  click: async () => {
                                      Actions.about().catch((err: Error) => {
                                          this.log().error(
                                              `Fail call action About: ${err.message}`,
                                          );
                                      });
                                  },
                              },
                              { type: 'separator' },
                              {
                                  label: 'Developing',
                                  submenu: [
                                      { role: 'reload' },
                                      { role: 'forceReload' },
                                      { role: 'toggleDevTools' },
                                  ],
                              },
                              { type: 'separator' },
                              {
                                  label: this.isMac ? 'Quit' : 'Close',
                                  registerAccelerator: false,
                                  accelerator: 'CommandOrControl + Q',
                                  click: () => {
                                      global.application
                                          .shutdown('ClosingWithMenu')
                                          .close()
                                          .catch((err: Error) => {
                                              this.log().error(`Fail to close: ${err.message}`);
                                          });
                                  },
                              },
                          ],
                      },
                  ]
                : []),
            {
                label: 'Edit',
                submenu: [
                    { role: 'undo' },
                    { role: 'redo' },
                    { type: 'separator' },
                    { role: 'cut' },
                    { role: 'copy' },
                    { role: 'paste' },
                    { type: 'separator' },
                    { role: 'selectAll' },
                ],
            },
            {
                label: 'View',
                submenu: [
                    { role: 'resetZoom' },
                    { role: 'zoomIn' },
                    { role: 'zoomOut' },
                    { type: 'separator' },
                    { role: 'togglefullscreen' },
                ],
            },
            {
                label: 'Window',
                submenu: [
                    { role: 'minimize' },
                    { role: 'zoom' },
                    ...(this.isMac
                        ? [
                              { type: 'separator' },
                              { role: 'front' },
                              { type: 'separator' },
                              { role: 'window' },
                          ]
                        : [{ role: 'close' }]),
                ],
            },
        ] as unknown as MenuItem[];
    }
}
export interface Service extends Interface {}
export const menu = register(new Service());
