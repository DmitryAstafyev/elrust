import { executor as SleepExecutor } from './session.sleep.executor';
import { executor as ExternalCallLib } from './session.externalcalllib.executor';

export const Executors = {
    sleep: SleepExecutor,
    externalCallLib: ExternalCallLib,
};
