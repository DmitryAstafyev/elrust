import { Define, Interface, SignatureRequirement } from '../declarations';

import * as validator from '../../../env/obj';

@Define({ name: 'SearchValuesRequest' })
export class Request extends SignatureRequirement {
    public session: string;
    public filters: string[];

    constructor(input: { session: string; filters: string[] }) {
        super();
        validator.isObject(input);
        this.session = validator.getAsNotEmptyString(input, 'session');
        this.filters = validator.getAsArray(input, 'filters');
    }
}

export interface Request extends Interface {}

@Define({ name: 'SearchValuesResponse' })
export class Response extends SignatureRequirement {
    public session: string;
    public canceled: boolean;
    public error?: string;

    constructor(input: { session: string; canceled: boolean; error?: string }) {
        super();
        validator.isObject(input);
        this.session = validator.getAsNotEmptyString(input, 'session');
        this.canceled = validator.getAsBool(input, 'canceled');
        this.error = validator.getAsNotEmptyStringOrAsUndefined(input, 'error');
    }
}

export interface Response extends Interface {}
