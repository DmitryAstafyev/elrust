import { TExecutor, Logger, CancelablePromise, AsyncResultsExecutor } from './executor';
import { RustSession } from '../../native/native.session';
import { EventProvider } from '../session.provider';
import { error } from 'platform/log/utils';

export interface IExecuteExternalCallLibOptions {
    path: string;
    a: number;
    b: number;
    lines: string[];
}
export interface IExternalCallLibResults {
    sum: number;
    found: string | undefined;
}

export const executor: TExecutor<IExternalCallLibResults, IExecuteExternalCallLibOptions> = (
    session: RustSession,
    provider: EventProvider,
    logger: Logger,
    options: IExecuteExternalCallLibOptions,
): CancelablePromise<IExternalCallLibResults> => {
    return AsyncResultsExecutor<IExternalCallLibResults, IExecuteExternalCallLibOptions>(
        session,
        provider,
        logger,
        options,
        function (
            session: RustSession,
            options: IExecuteExternalCallLibOptions,
            operationUuid: string,
        ): Promise<void> {
            return session.externalCallLib(
                operationUuid,
                options.path,
                options.a,
                options.b,
                options.lines,
            );
        },
        function (
            data: any,
            resolve: (res: IExternalCallLibResults) => void,
            reject: (err: Error) => void,
        ) {
            try {
                const result: [number, string | undefined] = JSON.parse(data);
                if (result instanceof Array && result.length === 2) {
                    return resolve({ sum: result[0], found: result[1] });
                }
                return reject(new Error(`Fail to parse ExternalCallLib results.`));
            } catch (e) {
                reject(new Error(`Fail to parse ExternalCallLib results with error: ${error(e)}`));
            }
        },
        'ExternalCallLib',
    );
};
