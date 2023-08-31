import moduleAlias from 'module-alias';
import * as path from 'path';

const MODULES: { [key: string]: string } = {
    '@register': 'register',
    '@env': 'env',
    '@module': 'modules',
    '@loader': 'loaders',
    '@log': 'env/logs',
    '@controller': 'controller',
    '@service': 'service',
};
const ROOT_PATH = (function () {
    return __dirname.replace(/loaders$/gi, '');
})();

function getModulePath(str: string): string {
    return path.resolve(ROOT_PATH, str);
}

export function setup() {
    const modules: { [key: string]: string } = {};
    Object.keys(MODULES).forEach((mod) => {
        modules[mod] = getModulePath(MODULES[mod]);
    });
    moduleAlias.addAliases(modules);
}

setup();
