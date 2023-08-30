/* eslint-disable @typescript-eslint/no-unused-vars */
import { RustSessionRequiered } from '../native/native.session.required';
import { TEventEmitter } from '../provider/provider.general';
import { Computation } from '../provider/provider';
import { getNativeModule } from '../native/native';
import { Type, Source, NativeError } from '../interfaces/errors';
import { v4 as uuidv4 } from 'uuid';
import { Logger, utils } from 'platform/log';
import { scope } from 'platform/env/scope';

export type RustSessionConstructorImpl<T> = new (
    uuid: string,
    provider: Computation<any, any, any>,
    cb: (err: Error | undefined) => void,
) => T;
export type TCanceler = () => void;

// Create abstract class to declare available methods
export abstract class RustSession extends RustSessionRequiered {
    constructor(uuid: string, provider: Computation<any, any, any>) {
        super();
    }

    public abstract override destroy(): Promise<void>;

    public abstract getUuid(): string;

    public abstract abort(
        selfOperationUuid: string,
        targetOperationUuid: string,
    ): NativeError | undefined;

    public abstract setDebug(debug: boolean): Promise<void>;

    public abstract getOperationsStat(): Promise<string>;

    // Used only for testing and debug
    public abstract sleep(operationUuid: string, duration: number): Promise<void>;

    // Used only for testing and debug
    public abstract triggerStateError(): Promise<void>;

    // Used only for testing and debug
    public abstract triggerTrackerError(): Promise<void>;
}

export abstract class RustSessionNative {
    public abstract stop(operationUuid: string): Promise<void>;

    public abstract init(callback: TEventEmitter): Promise<void>;

    public abstract getUuid(): string;

    public abstract abort(
        selfOperationUuid: string,
        targetOperationUuid: string,
    ): NativeError | undefined;

    public abstract setDebug(debug: boolean): Promise<void>;

    public abstract getOperationsStat(): Promise<string>;

    // Used only for testing and debug
    public abstract sleep(operationUuid: string, duration: number): Promise<void>;

    // Used only for testing and debug
    public abstract triggerStateError(): Promise<void>;

    // Used only for testing and debug
    public abstract triggerTrackerError(): Promise<void>;
}

export function rustSessionFactory(
    uuid: string,
    provider: Computation<any, any, any>,
): Promise<RustSession> {
    return new Promise((resolve, reject) => {
        const session = new RustSessionConstructor(uuid, provider, (err: Error | undefined) => {
            if (err instanceof Error) {
                reject(err);
            } else {
                resolve(session);
            }
        });
    });
}

export class RustSessionWrapper extends RustSession {
    private readonly _logger: Logger = scope.getLogger(`RustSessionWrapper`);
    private readonly _uuid: string;
    private readonly _native: RustSessionNative;
    private _assigned: boolean = false;
    private _provider: Computation<any, any, any>;

    constructor(
        uuid: string,
        provider: Computation<any, any, any>,
        cb: (err: Error | undefined) => void,
    ) {
        super(uuid, provider);
        this._native = new (getNativeModule().RustSession)(uuid) as RustSessionNative;
        this._logger.debug(`Rust native session is created`);
        this._uuid = uuid;
        this._provider = provider;
        this._provider.debug().emit.operation('init');
        this._native
            .init(provider.getEmitter())
            .then(() => {
                this._logger.debug(`Rust native session is inited`);
                cb(undefined);
            })
            .catch((err: Error) => {
                this._logger.error(
                    `Fail to init session: ${err instanceof Error ? err.message : err}`,
                );
                cb(err);
            });
    }

    public destroy(): Promise<void> {
        const destroyOperationId = uuidv4();
        this._provider.debug().emit.operation('stop', destroyOperationId);
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this._logger.error(`Timeout error. Session wasn't closed in 5 sec.`);
                reject(new Error(`Timeout error. Session wasn't closed in 5 sec.`));
            }, 5000);
            this._native
                .stop(destroyOperationId)
                .then(() => {
                    this._logger.debug(`Session has been destroyed`);
                    resolve();
                })
                .catch((err: Error) => {
                    this._logger.error(
                        `Fail to close session due error: ${
                            err instanceof Error ? err.message : err
                        }`,
                    );
                    reject(err);
                })
                .finally(() => {
                    clearTimeout(timeout);
                });
        });
    }

    public getUuid(): string {
        return this._native.getUuid();
    }

    public abort(selfOperationUuid: string, targetOperationUuid: string): NativeError | undefined {
        try {
            this._provider.debug().emit.operation('abort', selfOperationUuid);
            return this._native.abort(selfOperationUuid, targetOperationUuid);
        } catch (err) {
            return new NativeError(NativeError.from(err), Type.CancelationError, Source.Abort);
        }
    }

    public setDebug(debug: boolean): Promise<void> {
        return new Promise((resolve, reject) => {
            this._native
                .setDebug(debug)
                .then(resolve)
                .catch((err) => {
                    reject(new NativeError(NativeError.from(err), Type.Other, Source.SetDebug));
                });
        });
    }

    public getOperationsStat(): Promise<string> {
        return new Promise((resolve, reject) => {
            this._native
                .getOperationsStat()
                .then(resolve)
                .catch((err) => {
                    reject(
                        new NativeError(
                            NativeError.from(err),
                            Type.Other,
                            Source.GetOperationsStat,
                        ),
                    );
                });
        });
    }

    // Used only for testing and debug
    public sleep(operationUuid: string, duration: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this._provider.debug().emit.operation('sleep', operationUuid);
            this._native
                .sleep(operationUuid, duration)
                .then(resolve)
                .catch((err) => {
                    reject(new NativeError(NativeError.from(err), Type.Other, Source.Sleep));
                });
        });
    }

    // Used only for testing and debug
    public triggerStateError(): Promise<void> {
        return new Promise((resolve, reject) => {
            this._provider.debug().emit.operation('triggerStateError');
            this._native
                .triggerStateError()
                .then(resolve)
                .catch((err) => {
                    reject(
                        new NativeError(
                            NativeError.from(err),
                            Type.Other,
                            Source.TriggerStateError,
                        ),
                    );
                });
        });
    }

    // Used only for testing and debug
    public triggerTrackerError(): Promise<void> {
        return new Promise((resolve, reject) => {
            this._provider.debug().emit.operation('triggerTrackerError');
            this._native
                .triggerTrackerError()
                .then(resolve)
                .catch((err) => {
                    reject(
                        new NativeError(
                            NativeError.from(err),
                            Type.Other,
                            Source.TriggerTrackerError,
                        ),
                    );
                });
        });
    }
}

export const RustSessionWrapperConstructor: RustSessionConstructorImpl<RustSessionWrapper> =
    RustSessionWrapper;

export const RustSessionConstructor: RustSessionConstructorImpl<RustSession> =
    RustSessionWrapperConstructor;
