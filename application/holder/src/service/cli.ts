import {
    SetupService,
    Interface,
    Implementation,
    register,
    DependOn,
} from 'platform/entity/service';
import { services } from '@register/services';
import { electron } from '@service/electron';
import { paths } from '@service/paths';
import { envvars } from '@loader/envvars';
import { isDevelopingExecuting } from '@loader/cli';
import { exec } from 'sudo-prompt';
import { getActions } from '@loader/cli';

import * as Actions from './cli/index';
import * as Events from 'platform/ipc/event';
import * as fs from 'fs';

const UNIX_LOCAL_BIN = '/usr/local/bin';
const UNIX_SYMLINK_PATH = `${UNIX_LOCAL_BIN}/cm`;

@DependOn(paths)
@DependOn(electron)
@SetupService(services['cli'])
export class Service extends Implementation {
    public readonly cwd: string = process.cwd();

    protected args: string[] = [];

    private _available: boolean | undefined;

    public override ready(): Promise<void> {
        this.log().debug(`Incoming arguments:\n\t${process.argv.join('\n\t')}`);
        this.log().verbose(`TTY: ${process.stdout.isTTY ? 'connected' : 'unavailable'}`);
        this.log().debug(`CWD: ${process.cwd()}`);
        this.log().verbose(`Executor: ${process.execPath}`);
        const executor = process.argv.shift();
        if (executor === undefined) {
            // Unexpected amount of arguments
            return Promise.resolve();
        }
        if (isDevelopingExecuting(executor)) {
            const mod = process.argv.findIndex((arg) => {
                return arg.toLowerCase().endsWith('.js');
            });
            if (mod === -1) {
                this.log().warn(
                    `Application in dev-mode (running with electron), but JS module isn't found`,
                );
                return Promise.resolve();
            } else {
                this.log().debug(
                    `Application in dev-mode (running with electron); main module (index: ${mod}): ${process.argv[mod]}`,
                );
            }
            this.args = process.argv.splice(mod + 1, process.argv.length);
        } else {
            this.args = process.argv.splice(0, process.argv.length);
        }
        if (this.args.length === 0) {
            this.log().debug(`No any CLI actions would be applied: no income arguments.`);
        } else {
            this.log().debug(`Accepted arguments:\n\t${this.args.join('\n\t')}`);
        }
        this.register(
            Events.IpcEvent.subscribe(
                Events.State.Client.Event,
                (event: Events.State.Client.Event) => {
                    if (event.state !== Events.State.Client.State.Ready) {
                        return;
                    }
                    this.check().catch((err: Error) => {
                        this.log().error(`Fail to proccess CLI actions: ${err.message}`);
                    });
                },
            ),
        );
        return Promise.resolve();
    }

    protected async check(): Promise<void> {
        const actions = getActions();
        const runner = async (actions: Actions.CLIAction[]): Promise<void> => {
            for (const action of actions) {
                await action.execute(this);
            }
        };
        await runner(actions.filter((a) => a.type() === Actions.Type.StateModifier));
        await runner(actions.filter((a) => a.type() === Actions.Type.Action));
        await runner(actions.filter((a) => a.type() === Actions.Type.AfterActions));
        Events.IpcEvent.emit(new Events.Cli.Done.Event());
    }
}
export interface Service extends Interface {}
export const cli = register(new Service());
