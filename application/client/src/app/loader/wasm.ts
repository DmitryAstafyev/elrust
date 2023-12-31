import { scope } from '@platform/env/scope';

import * as matcher from '@matcher/matcher';
import * as utils from '@utils/utils';

export { Matcher } from '@matcher/matcher';

const wasm: {
    matcher: typeof matcher | undefined;
    utils: typeof utils | undefined;
} = {
    matcher: undefined,
    utils: undefined,
};

export function load(): Promise<void> {
    const logger = scope.getLogger('wasm');
    return Promise.all([
        import('@matcher/matcher')
            .then((module) => {
                wasm.matcher = module;
                logger.debug(`@matcher/matcher is loaded`);
            })
            .catch((err: Error) => {
                logger.error(`fail to load @matcher/matcher: ${err.message}`);
            }),
        import('@utils/utils')
            .then((module) => {
                wasm.utils = module;
                logger.debug(`@utils/utils is loaded`);
            })
            .catch((err: Error) => {
                logger.error(`fail to load @utils/utils: ${err.message}`);
            }),
    ])
        .catch((err: Error) => {
            logger.error(`Fail to load wasm modules: ${err.message}`);
        })
        .then((_) => void 0);
}

export function getMatcher(): typeof matcher {
    if (wasm.matcher === undefined) {
        throw new Error(`wasm module "matcher" isn't loaded`);
    }
    return wasm.matcher;
}

export function getUtils(): typeof utils {
    if (wasm.utils === undefined) {
        throw new Error(`wasm module "utils" isn't loaded`);
    }
    return wasm.utils;
}
