import { v4 } from 'uuid';
import { setUuidGenerator } from 'platform/env/sequence';

import * as Units from './util/units';
import * as Interfaces from './interfaces/index';
import * as Events from 'platform/env/subscription';

export { CancelablePromise, PromiseExecutor, ICancelablePromise } from 'platform/env/promise';
export { Session, ISessionEvents } from './api/session';
export { Jobs } from './api/jobs';
export { Tracker } from './api/tracker';

export { Units, Events, Interfaces };

setUuidGenerator(v4);
