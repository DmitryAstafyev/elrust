import { Define, Interface, SignatureRequirement } from '../declarations';

import * as validator from '../../../env/obj';

@Define({ name: 'SessionExternalCallLibRequest' })
export class Request extends SignatureRequirement {
    public uuid: string;
    public a: number;
    public b: number;
    public lines: string[];

    constructor(input: { uuid: string; a: number; b: number; lines: string[] }) {
        super();
        this.uuid = validator.getAsNotEmptyString(input, 'uuid');
        this.a = validator.getAsValidNumber(input, 'a');
        this.b = validator.getAsValidNumber(input, 'b');
        this.lines = validator.getAsArray(input, 'lines');
        validator.isObject(input);
    }
}
export interface Request extends Interface {}

@Define({ name: 'SessionExternalCallLibResponse' })
export class Response extends SignatureRequirement {
    public sum: number;
    public found: string | undefined;

    constructor(input: { sum: number; found: string | undefined }) {
        super();
        validator.isObject(input);
        this.sum = validator.getAsValidNumber(input, 'sum');
        this.found = validator.getAsNotEmptyStringOrAsUndefined(input, 'found');
    }
}

export interface Response extends Interface {}
