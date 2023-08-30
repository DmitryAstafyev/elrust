import { Define, Interface, SignatureRequirement } from '../declarations';
import * as validator from '../../../env/obj';

@Define({ name: 'OtherSleepRequest' })
export class Request extends SignatureRequirement {
    public uuid: string;
    public duration: number;

    constructor(input: { uuid: string; duration: number }) {
        super();
        validator.isObject(input);
        this.uuid = validator.getAsNotEmptyString(input, 'uuid');
        this.duration = validator.getAsValidNumber(input, 'duration');
    }
}
export interface Request extends Interface {}

@Define({ name: 'OtherSleepResponse' })
export class Response extends SignatureRequirement {
    public error: string | undefined;

    constructor(input: { error: string | undefined }) {
        super();
        validator.isObject(input);
        this.error = validator.getAsNotEmptyStringOrAsUndefined(input, 'error');
    }
}

export interface Response extends Interface {}
