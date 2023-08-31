import { program as cli } from 'commander';
import { CLIAction } from '@service/cli/action';
import { spawn } from 'child_process';
import { Socket } from 'net';
import { WriteStream } from 'fs';
import { logger } from './logger';

const DEV_EXECUTOR_PATH = 'node_modules/electron/dist/electron';
const DEV_EXECUTOR_PATH_DARVIN = 'node_modules/electron/dist/Electron.app/Contents/MacOS/Electron';
const RESTARTING_FLAG = '--app_restarted';
const DEBUG_FLAG = '--debug_mode';

function getDevExecutorPath(): string {
    if (process.platform === 'darwin') {
        return DEV_EXECUTOR_PATH_DARVIN;
    } else {
        return DEV_EXECUTOR_PATH;
    }
}
export function isDevelopingExecuting(path: string): boolean {
    const devPath = getDevExecutorPath();
    return path.toLowerCase().indexOf(devPath.toLowerCase()) !== -1;
}

const CLI_HANDLERS: { [key: string]: CLIAction } = {};

export function getActions(): CLIAction[] {
    return Object.keys(CLI_HANDLERS).map((k) => CLI_HANDLERS[k]);
}

function collectErrors(): Error[] {
    const errors: Error[] = [];
    Object.keys(CLI_HANDLERS).forEach((key: string) => {
        errors.push(...CLI_HANDLERS[key].errors());
    });
    return errors;
}

function _parser(handler: CLIAction): (value: string, prev: string) => string {
    return handler.argument.bind(handler, process.cwd()) as unknown as (
        value: string,
        prev: string,
    ) => string;
}

function setup() {
    logger.write(`setup CLI: started`);
    cli.parse();
    logger.write(`setup CLI: done and parsered`);
}

function lock() {
    [process.stdin, process.stdout, process.stderr].forEach((stream) => {
        typeof stream.end === 'function' && stream.end();
        stream.destroy();
    });
    logger.write(`STD's are locked`);
}

function exit() {
    logger.write(`exiting`);
    process.exit(0);
}

function isSyncWriteStream(std: unknown): boolean {
    // Note SyncWriteStream is depricated, but it doesn't mean
    // it isn't used
    return (std as { constructor: { name: string } }).constructor.name === 'SyncWriteStream';
}

function isTTY(): boolean {
    if (typeof process.stdout.isTTY === 'boolean') {
        return process.stdout.isTTY;
    }
    if (
        (process.platform === 'linux' || process.platform === 'darwin') &&
        process.stdout.isTTY === undefined
    ) {
        return false;
    }
    if ((process.stdout as unknown) instanceof Socket) {
        // On windows: gitbash
        return true;
    }
    if (isSyncWriteStream(process.stdout) || (process.stdout as unknown) instanceof WriteStream) {
        // On windows: CMD, PowerShell
        return true;
    }
    return false;
}

function isRestartedAlready(): boolean {
    logger.write(`RESTARTING_FLAG=${process.argv.includes(RESTARTING_FLAG)}`);
    return process.argv.includes(RESTARTING_FLAG);
}

function isDebugMode(): boolean {
    logger.write(`DEBUG_FLAG=${process.argv.includes(DEBUG_FLAG)}`);
    return process.argv.includes(DEBUG_FLAG);
}

function check() {
    if (isDebugMode()) {
        return;
    }
    // TODO:
    // - send as argument PID of current process
    // - check and kill previous process by given PID
    setup();
    if (isRestartedAlready()) {
        return;
    }
    if (!isTTY()) {
        logger.write(`context is TTY`);
        return;
    }
    logger.write(`TTY isn't detected`);
    const args = process.argv.slice();
    const executor = args.shift();
    logger.write(`executor=${executor}`);
    if (executor === undefined) {
        // Unexpected amount of arguments
        return;
    }
    if (isDevelopingExecuting(executor)) {
        logger.write(`developing executing`);
        // Developing mode
        return;
    }
    const errors = collectErrors();
    if (errors.length > 0) {
        errors.forEach((err) => {
            process.stdout.write(`${err.message}\n`);
        });
        lock();
        exit();
    }
    args.push(RESTARTING_FLAG);
    spawn(executor, args, {
        shell: false,
        detached: true,
        stdio: 'ignore',
    });
    logger.write(`${executor} has been spawned`);
    lock();
    exit();
}
check();
