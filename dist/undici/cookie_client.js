"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCookieClient = exports.CookieClient = void 0;
const undici_1 = require("undici");
const symbols_1 = require("undici/lib/core/symbols");
const redirect_1 = require("undici/lib/handler/redirect");
const create_cookie_header_value_1 = require("../utils/create_cookie_header_value");
const validate_cookie_options_1 = require("../utils/validate_cookie_options");
const cookie_handler_1 = require("./cookie_handler");
const convert_to_headers_object_1 = require("./utils/convert_to_headers_object");
const kCookieOptions = Symbol('cookieOptions');
function createCookieClient(BaseClientClass) {
    // @ts-expect-error ...
    class CookieClient extends BaseClientClass {
        [kCookieOptions];
        constructor(url, { cookies: cookieOpts, ...options } = {}) {
            super(url, options);
            if (cookieOpts) {
                (0, validate_cookie_options_1.validateCookieOptions)(cookieOpts);
                this[kCookieOptions] = cookieOpts;
            }
        }
        [symbols_1.kDispatch](opts, handler) {
            const { maxRedirections = this[symbols_1.kMaxRedirections] } = opts;
            if (maxRedirections) {
                opts = { ...opts, maxRedirections: 0 };
                handler = new redirect_1.RedirectHandler(this, maxRedirections, opts, handler);
            }
            const cookieOptions = this[kCookieOptions];
            if (cookieOptions) {
                const origin = opts.origin || this[symbols_1.kUrl].origin;
                const requestUrl = new URL(opts.path, origin).toString();
                const headers = (0, convert_to_headers_object_1.convertToHeadersObject)(opts.headers);
                const cookieHeader = (0, create_cookie_header_value_1.createCookieHeaderValue)({
                    cookieOptions,
                    passedValues: [headers['cookie']],
                    requestUrl,
                });
                if (cookieHeader) {
                    headers['cookie'] = cookieHeader;
                }
                opts = { ...opts, headers };
                handler = new cookie_handler_1.CookieHandler(requestUrl, cookieOptions, handler);
            }
            return super[symbols_1.kDispatch](opts, handler);
        }
    }
    return CookieClient;
}
exports.createCookieClient = createCookieClient;
const CookieClient = createCookieClient(undici_1.Client);
exports.CookieClient = CookieClient;
