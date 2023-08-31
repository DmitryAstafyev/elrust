import * as About from './about';
import * as Updates from './updates';
import * as Settings from './settings';
import * as Exit from './exit';
import * as Help from './help';

import { Base } from './action';

export * as About from './about';
export * as Updates from './updates';
export * as Settings from './settings';
export * as Exit from './exit';
export * as Help from './help';

export { Base } from './action';

export const all = [
    [About.ACTION_UUID, About.Action],
    [Updates.ACTION_UUID, Updates.Action],
    [Settings.ACTION_UUID, Settings.Action],
    [Help.ACTION_UUID, Help.Action],
    [Exit.ACTION_UUID, Exit.Action],
];

export function getActionByUuid(uuid: string): Base | undefined {
    const action = all.find((d) => d[0] === uuid);
    return action === undefined ? undefined : new (action[1] as { new (): Base })();
}
