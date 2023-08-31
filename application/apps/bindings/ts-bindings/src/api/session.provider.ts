import { Subject } from 'platform/env/subscription';
import { Computation } from '../provider/provider';
import { EErrorKind, EErrorSeverity } from '../provider/provider.errors';

export interface IError {
    severity: EErrorSeverity;
    kind: EErrorKind;
    message?: string;
}

export interface IErrorEvent {
    uuid: string;
    error: IError;
}

export interface IOperationDoneEvent {
    uuid: string;
    result: any;
}

export interface ISessionEvents {
    SessionError: Subject<IError>;
    OperationError: Subject<IErrorEvent>;
    SessionDestroyed: Subject<void>;
    OperationStarted: Subject<string>;
    OperationProcessing: Subject<string>;
    OperationDone: Subject<IOperationDoneEvent>;
}

export interface ISessionEventsConvertors {}

interface ISessionEventsSignatures {
    SessionError: 'SessionError';
    OperationError: 'OperationError';
    SessionDestroyed: 'SessionDestroyed';
    OperationStarted: 'OperationStarted';
    OperationProcessing: 'OperationProcessing';
    OperationDone: 'OperationDone';
}

const SessionEventsSignatures: ISessionEventsSignatures = {
    SessionError: 'SessionError',
    OperationError: 'OperationError',
    SessionDestroyed: 'SessionDestroyed',
    OperationStarted: 'OperationStarted',
    OperationProcessing: 'OperationProcessing',
    OperationDone: 'OperationDone',
};

interface ISessionEventsInterfaces {
    SessionError: { self: 'object'; severity: 'string'; message: 'string'; kind: 'string' };
    OperationError: {
        self: 'object';
        uuid: 'string';
        error: { self: 'object'; severity: 'string'; message: 'string'; kind: 'string' };
    };
    SessionDestroyed: { self: null };
    OperationStarted: { self: 'string' };
    OperationProcessing: { self: 'string' };
    OperationDone: { self: 'object'; uuid: 'string'; result: 'any' };
}

const SessionEventsInterfaces: ISessionEventsInterfaces = {
    SessionError: { self: 'object', severity: 'string', message: 'string', kind: 'string' },
    OperationError: {
        self: 'object',
        uuid: 'string',
        error: { self: 'object', severity: 'string', message: 'string', kind: 'string' },
    },
    SessionDestroyed: { self: null },
    OperationStarted: { self: 'string' },
    OperationProcessing: { self: 'string' },
    OperationDone: { self: 'object', uuid: 'string', result: 'any' },
};

export class EventProvider extends Computation<
    ISessionEvents,
    ISessionEventsSignatures,
    ISessionEventsInterfaces
> {
    private readonly _events: ISessionEvents = {
        SessionError: new Subject<IError>(),
        OperationError: new Subject<IErrorEvent>(),
        SessionDestroyed: new Subject<void>(),
        OperationStarted: new Subject<string>(),
        OperationProcessing: new Subject<string>(),
        OperationDone: new Subject<IOperationDoneEvent>(),
    };

    private readonly _convertors: ISessionEventsConvertors = {};

    constructor(uuid: string) {
        super(uuid);
    }

    public getName(): string {
        return 'EventProvider';
    }

    public getEvents(): ISessionEvents {
        return this._events;
    }

    public getEventsSignatures(): ISessionEventsSignatures {
        return SessionEventsSignatures;
    }

    public getEventsInterfaces(): ISessionEventsInterfaces {
        return SessionEventsInterfaces;
    }

    public getConvertor<T, O>(event: keyof ISessionEventsSignatures, data: T): T | O | Error {
        const convertors = this._convertors as unknown as { [key: string]: (data: T) => T | O };
        if (typeof convertors[event] !== 'function') {
            return data;
        } else {
            return convertors[event](data);
        }
    }
}
