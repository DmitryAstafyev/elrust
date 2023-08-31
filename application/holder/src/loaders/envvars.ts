import { getEnvVar, getElectronAppShellEnvVars } from '@env/os';
import { setProp, getProp } from 'platform/env/obj';

export enum EElrustEnvVars {
    /**
     * ON - activate developing mode:
     * - all plugins processes will be started with debug-listener
     * - browser will be started with devtools
     */
    ELRUST_DEVELOPING_MODE = 'ELRUST_DEVELOPING_MODE',

    /**
     * ON - activate webtools in developing mode
     * OFF - deactivate webtools in developing mode
     */
    ELRUST_NO_WEBDEVTOOLS = 'ELRUST_NO_WEBDEVTOOLS',

    /**
     * Definition of log level:
     * - INFO (I, IN),
     * - DEBUG (D, DEB),
     * - WARNING (W, WAR, WARN),
     * - VERBOS (V, VER, VERBOSE),
     * - ERROR (E, ERR),
     * - ENV - ENV logs never writes into logs file; it's just shown in stdout,
     * - WTF - WTF logs useful for debuggin. If at least one WTF log was sent, only WTF logs will be shown. This logs never writes into logs file,
     */
    ELRUST_DEV_LOGLEVEL = 'ELRUST_DEV_LOGLEVEL',

    /**
     * TRUE (true, ON, on) - prevent recording render's logs into backend
     */
    ELRUST_NO_RENDER_LOGS = 'ELRUST_NO_RENDER_LOGS',

    /**
     * Path to custom plugins folder
     */
    ELRUST_PLUGINS_SANDBOX = 'ELRUST_PLUGINS_SANDBOX',

    /**
     * TRUE (true, ON, on) - prevent downloading of defaults plugins
     */
    ELRUST_PLUGINS_NO_DEFAULTS = 'ELRUST_PLUGINS_NO_DEFAULTS',

    /**
     * TRUE (true, ON, on) - prevent upgrade plugins
     */
    ELRUST_PLUGINS_NO_UPGRADE = 'ELRUST_PLUGINS_NO_UPGRADE',

    /**
     * TRUE (true, ON, on) - prevent update plugins workflow
     */
    ELRUST_PLUGINS_NO_UPDATES = 'ELRUST_PLUGINS_NO_UPDATES',

    /**
     * TRUE (true, ON, on) - prevent removing not valid plugins
     */
    ELRUST_PLUGINS_NO_REMOVE_NOTVALID = 'ELRUST_PLUGINS_NO_REMOVE_NOTVALID',
}

export const CElrustEnvVars: string[] = [
    EElrustEnvVars.ELRUST_DEVELOPING_MODE,
    EElrustEnvVars.ELRUST_DEV_LOGLEVEL,
    EElrustEnvVars.ELRUST_NO_RENDER_LOGS,
    EElrustEnvVars.ELRUST_PLUGINS_SANDBOX,
    EElrustEnvVars.ELRUST_PLUGINS_NO_DEFAULTS,
    EElrustEnvVars.ELRUST_PLUGINS_NO_UPDATES,
    EElrustEnvVars.ELRUST_PLUGINS_NO_UPGRADE,
    EElrustEnvVars.ELRUST_PLUGINS_NO_REMOVE_NOTVALID,
];

export interface IElrustEnvVars {
    ELRUST_DEVELOPING_MODE: boolean | undefined;
    ELRUST_NO_WEBDEVTOOLS: boolean | undefined;
    ELRUST_NO_RENDER_LOGS: boolean | undefined;
    ELRUST_DEV_LOGLEVEL: string | undefined;
    ELRUST_PLUGINS_SANDBOX: string | undefined;
    ELRUST_PLUGINS_NO_DEFAULTS: boolean | undefined;
    ELRUST_PLUGINS_NO_UPDATES: boolean | undefined;
    ELRUST_PLUGINS_NO_UPGRADE: boolean | undefined;
    ELRUST_PLUGINS_NO_REMOVE_NOTVALID: boolean | undefined;
}

const CElrustEnvVarsParsers: { [key: string]: (smth: unknown) => boolean } = {
    [EElrustEnvVars.ELRUST_DEVELOPING_MODE]: (smth: unknown): boolean => {
        if (
            typeof smth === 'string' &&
            ['true', 'on', '1'].indexOf(smth.toLowerCase().trim()) !== -1
        ) {
            return true;
        }
        if (typeof smth === 'number' && smth === 1) {
            return true;
        }
        return false;
    },
    [EElrustEnvVars.ELRUST_NO_WEBDEVTOOLS]: (smth: unknown): boolean => {
        if (
            typeof smth === 'string' &&
            ['true', 'on', '1'].indexOf(smth.toLowerCase().trim()) !== -1
        ) {
            return true;
        }
        if (typeof smth === 'number' && smth === 1) {
            return true;
        }
        return false;
    },
    [EElrustEnvVars.ELRUST_NO_RENDER_LOGS]: (smth: unknown): boolean => {
        if (
            typeof smth === 'string' &&
            ['true', 'on', '1'].indexOf(smth.toLowerCase().trim()) !== -1
        ) {
            return true;
        }
        if (typeof smth === 'number' && smth === 1) {
            return true;
        }
        return false;
    },
    [EElrustEnvVars.ELRUST_PLUGINS_NO_DEFAULTS]: (smth: unknown): boolean => {
        if (
            typeof smth === 'string' &&
            ['true', 'on', '1'].indexOf(smth.toLowerCase().trim()) !== -1
        ) {
            return true;
        }
        if (typeof smth === 'number' && smth === 1) {
            return true;
        }
        return false;
    },
    [EElrustEnvVars.ELRUST_PLUGINS_NO_UPDATES]: (smth: unknown): boolean => {
        if (
            typeof smth === 'string' &&
            ['true', 'on', '1'].indexOf(smth.toLowerCase().trim()) !== -1
        ) {
            return true;
        }
        if (typeof smth === 'number' && smth === 1) {
            return true;
        }
        return false;
    },
    [EElrustEnvVars.ELRUST_PLUGINS_NO_UPGRADE]: (smth: unknown): boolean => {
        if (
            typeof smth === 'string' &&
            ['true', 'on', '1'].indexOf(smth.toLowerCase().trim()) !== -1
        ) {
            return true;
        }
        if (typeof smth === 'number' && smth === 1) {
            return true;
        }
        return false;
    },
    [EElrustEnvVars.ELRUST_PLUGINS_NO_REMOVE_NOTVALID]: (smth: unknown): boolean => {
        if (
            typeof smth === 'string' &&
            ['true', 'on', '1'].indexOf(smth.toLowerCase().trim()) !== -1
        ) {
            return true;
        }
        if (typeof smth === 'number' && smth === 1) {
            return true;
        }
        return false;
    },
};

const GeneralEnvVarsList = [
    EElrustEnvVars.ELRUST_DEVELOPING_MODE,
    EElrustEnvVars.ELRUST_NO_WEBDEVTOOLS,
    EElrustEnvVars.ELRUST_DEV_LOGLEVEL,
    EElrustEnvVars.ELRUST_NO_RENDER_LOGS,
    EElrustEnvVars.ELRUST_PLUGINS_SANDBOX,
    EElrustEnvVars.ELRUST_PLUGINS_NO_DEFAULTS,
    EElrustEnvVars.ELRUST_PLUGINS_NO_UPDATES,
    EElrustEnvVars.ELRUST_PLUGINS_NO_REMOVE_NOTVALID,
];

export class GeneralEnvVars {
    private _env: IElrustEnvVars = {
        ELRUST_DEVELOPING_MODE: undefined,
        ELRUST_NO_WEBDEVTOOLS: undefined,
        ELRUST_DEV_LOGLEVEL: undefined,
        ELRUST_NO_RENDER_LOGS: undefined,
        ELRUST_PLUGINS_SANDBOX: undefined,
        ELRUST_PLUGINS_NO_DEFAULTS: undefined,
        ELRUST_PLUGINS_NO_UPDATES: undefined,
        ELRUST_PLUGINS_NO_UPGRADE: undefined,
        ELRUST_PLUGINS_NO_REMOVE_NOTVALID: undefined,
    };
    private _os: typeof process.env = process.env;

    public init(): Promise<void> {
        return new Promise((resolve) => {
            Promise.all(
                GeneralEnvVarsList.map((env: string) => {
                    return getEnvVar(env)
                        .then((value: string) => {
                            if (typeof value !== 'string' || value.trim() === '') {
                                setProp(this._env, env, undefined);
                            } else {
                                if (CElrustEnvVarsParsers[env] !== undefined) {
                                    setProp(this._env, env, CElrustEnvVarsParsers[env](value));
                                } else {
                                    setProp(this._env, env, value);
                                }
                            }
                        })
                        .catch((err: Error) => {
                            console.error(
                                `Cannot detect env "${env}" due error: ${
                                    err instanceof Error ? err.message : err
                                }`,
                            );
                            setProp(this._env, env, undefined);
                        });
                }),
            )
                .catch((error: Error) => {
                    // Drop all to default
                    GeneralEnvVarsList.forEach((env: string) => {
                        setProp(this._env, env, undefined);
                    });
                    console.error(`Fail to detect OS env due error: ${error.message}`);
                })
                .finally(() => {
                    getElectronAppShellEnvVars(process.execPath)
                        .then((vars) => {
                            this._os = vars;
                        })
                        .catch((err: Error) => {
                            console.error(
                                `Fail get all envvars due error: ${
                                    err instanceof Error ? err.message : err
                                }`,
                            );
                        })
                        .finally(resolve);
                });
        });
    }

    public get(): IElrustEnvVars {
        return Object.assign({}, this._env);
    }

    public getOS(): typeof process.env {
        return this._os;
    }

    public envsToString(): string {
        return `Next env vars are detected:\n${GeneralEnvVarsList.map((env: string) => {
            return `\t${env}=${getProp(this._env, env)}`;
        }).join('\n')}`;
    }
}

export const envvars = new GeneralEnvVars();
