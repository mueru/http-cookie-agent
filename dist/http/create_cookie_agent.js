"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCookieAgent = void 0;
const url_1 = __importDefault(require("url"));
const create_cookie_header_value_1 = require("../utils/create_cookie_header_value");
const save_cookies_from_header_1 = require("../utils/save_cookies_from_header");
const validate_cookie_options_1 = require("../utils/validate_cookie_options");
const kCookieOptions = Symbol('cookieOptions');
const kReimplicitHeader = Symbol('reimplicitHeader');
const kRecreateFirstChunk = Symbol('recreateFirstChunk');
const kOverrideRequest = Symbol('overrideRequest');
function createCookieAgent(BaseAgentClass) {
    // @ts-expect-error ...
    class CookieAgent extends BaseAgentClass {
        [kCookieOptions];
        constructor({ cookies: cookieOptions, ...options } = {}, ...rest) {
            super(options, ...rest);
            if (cookieOptions) {
                (0, validate_cookie_options_1.validateCookieOptions)(cookieOptions);
            }
            this[kCookieOptions] = cookieOptions;
        }
        [kReimplicitHeader](req) {
            const _headerSent = req._headerSent;
            req._header = null;
            req._implicitHeader();
            req._headerSent = _headerSent;
        }
        [kRecreateFirstChunk](req) {
            const firstChunk = req.outputData[0];
            if (req._header == null || firstChunk == null) {
                return;
            }
            const prevData = firstChunk.data;
            const prevHeaderLength = prevData.indexOf('\r\n\r\n');
            if (prevHeaderLength === -1) {
                firstChunk.data = req._header;
            }
            else {
                firstChunk.data = `${req._header}${prevData.slice(prevHeaderLength + 4)}`;
            }
            const diffSize = firstChunk.data.length - prevData.length;
            req.outputSize += diffSize;
            req._onPendingData(diffSize);
        }
        [kOverrideRequest](req, requestUrl, cookieOptions) {
            const _implicitHeader = req._implicitHeader.bind(req);
            req._implicitHeader = () => {
                try {
                    const cookieHeader = (0, create_cookie_header_value_1.createCookieHeaderValue)({
                        cookieOptions,
                        passedValues: [req.getHeader('Cookie')].flat(),
                        requestUrl,
                    });
                    if (cookieHeader) {
                        req.setHeader('Cookie', cookieHeader);
                    }
                }
                catch (err) {
                    req.destroy(err);
                    return;
                }
                return _implicitHeader();
            };
            const emit = req.emit.bind(req);
            req.emit = (event, ...args) => {
                if (event === 'response') {
                    try {
                        const res = args[0];
                        (0, save_cookies_from_header_1.saveCookiesFromHeader)({
                            cookieOptions,
                            cookies: res.headers['set-cookie'],
                            requestUrl,
                        });
                    }
                    catch (err) {
                        req.destroy(err);
                        return false;
                    }
                }
                return emit(event, ...args);
            };
        }
        addRequest(req, options) {
            const cookieOptions = this[kCookieOptions];
            if (cookieOptions) {
                try {
                    const requestUrl = url_1.default.format({
                        host: req.host,
                        pathname: req.path,
                        protocol: req.protocol,
                    });
                    this[kOverrideRequest](req, requestUrl, cookieOptions);
                    if (req._header != null) {
                        this[kReimplicitHeader](req);
                    }
                    if (req._headerSent) {
                        this[kRecreateFirstChunk](req);
                    }
                }
                catch (err) {
                    req.destroy(err);
                    return;
                }
            }
            return super.addRequest(req, options);
        }
    }
    return CookieAgent;
}
exports.createCookieAgent = createCookieAgent;
