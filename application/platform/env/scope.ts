import { Transport } from '../ipc/transport';
import { LoggerConstructor, Logger, Level } from '../log';
import { DefaultLogger } from '../log/defaults';
import { globals } from './globals';

export class Scope {
    private _transport: Transport | undefined;
    private _logger: LoggerConstructor<any> | undefined;
    private _vars: Map<string, unknown> = new Map();

    public setTransport(transport: Transport) {
        if (this._transport !== undefined) {
            throw new Error(`Transport can be setup only once`);
        }
        if (this._logger !== undefined) {
            new this._logger('@platform').debug(`IPC transport is up`);
        }
        this._transport = transport;
    }

    public getTransport(): Transport {
        if (this._transport === undefined) {
            throw new Error(`Transport isn't setup`);
        }
        return this._transport;
    }

    public setLogger(logger: LoggerConstructor<any>) {
        this._logger = logger;
        const border = '='.repeat(75);
        const regular: Logger = new this._logger('@platform').debug(
            `logger is up\n${border}\nSession: ${new Date().toUTCString()}\n${border}`,
        );
        const collected = DefaultLogger.getCollectedMessages();
        collected.length !== 0 && regular.push(collected);
    }

    public getLogger(alias: string): Logger {
        if (this._logger === undefined) {
            Logger.post(`Logger isn't setup. Default logger will be used.`, Level.ERROR);
            return new DefaultLogger(alias);
        } else {
            return new this._logger(alias);
        }
    }

    public setVar(key: string, value: unknown) {
        this._vars.set(key, value);
    }

    public getVar<T>(key: string): T | undefined {
        return this._vars.get(key) as T;
    }
}

export const scope = ((): Scope => {
    const key = 'scope';
    let scope = globals.get<Scope>(key);
    if (scope === undefined) {
        scope = new Scope();
        globals.set<Scope>(key, scope);
    }
    return scope;
})();
