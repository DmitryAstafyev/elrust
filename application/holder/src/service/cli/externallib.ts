import { CLIAction, Type } from './action';
import { Service } from '@service/cli';
import { scope } from 'platform/env/scope';

import * as fs from 'fs';

export class Action extends CLIAction {
    protected lib: string | undefined;
    protected error: Error[] = [];

    public name(): string {
        return 'External Library Linking';
    }

    public argument(_cwd: string, arg: string): string {
        this.lib = arg;
        if (!fs.existsSync(arg)) {
            this.error.push(new Error(`Cannot find file "${arg}". File doesn't exist`));
            return '';
        }
        return arg;
    }

    public errors(): Error[] {
        return this.error;
    }

    public execute(_cli: Service): Promise<void> {
        if (this.error.length > 0) {
            return Promise.reject(
                new Error(
                    `Handler cannot be executed, because errors: \n${this.error
                        .map((e) => e.message)
                        .join('\n')}`,
                ),
            );
        }
        if (this.lib === undefined) {
            return Promise.resolve();
        }
        scope.setVar('externallibpath', this.lib);
        return Promise.resolve();
    }

    public type(): Type {
        return Type.AfterActions;
    }

    public defined(): boolean {
        return this.lib !== undefined;
    }
}
