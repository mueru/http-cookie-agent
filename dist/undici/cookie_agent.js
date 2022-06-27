"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CookieAgent = void 0;
const undici_1 = require("undici");
const validate_cookie_options_1 = require("../utils/validate_cookie_options");
const cookie_client_1 = require("./cookie_client");
class CookieAgent extends undici_1.Agent {
    constructor({ cookies: cookieOpts, ...agentOpts } = {}) {
        if (agentOpts.factory) {
            throw new undici_1.errors.InvalidArgumentError('factory function cannot set via CookieAgent');
        }
        if (cookieOpts) {
            (0, validate_cookie_options_1.validateCookieOptions)(cookieOpts);
        }
        function factory(origin, opts) {
            if (opts && opts.connections === 1) {
                return new cookie_client_1.CookieClient(origin, {
                    ...opts,
                    cookies: cookieOpts,
                });
            }
            else {
                return new undici_1.Pool(origin, {
                    ...opts,
                    factory: (origin, opts) => {
                        return new cookie_client_1.CookieClient(origin, {
                            ...opts,
                            cookies: cookieOpts,
                        });
                    },
                });
            }
        }
        super({ ...agentOpts, factory });
    }
}
exports.CookieAgent = CookieAgent;
