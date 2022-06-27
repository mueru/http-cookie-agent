"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CookieHandler = void 0;
const undici_1 = require("undici");
const save_cookies_from_header_1 = require("../utils/save_cookies_from_header");
const convert_to_headers_object_1 = require("./utils/convert_to_headers_object");
const kRequestUrl = Symbol('requestUrl');
const kCookieOptions = Symbol('cookieOptions');
const kHandlers = Symbol('handlers');
class CookieHandler {
    [kRequestUrl];
    [kCookieOptions];
    [kHandlers];
    constructor(requestUrl, cookieOptions, handlers) {
        this[kRequestUrl] = requestUrl;
        this[kCookieOptions] = cookieOptions;
        this[kHandlers] = handlers;
    }
    onConnect = (abort) => {
        this[kHandlers].onConnect?.(abort);
    };
    onError = (err) => {
        this[kHandlers].onError?.(err);
    };
    onUpgrade = (statusCode, headers, socket) => {
        this[kHandlers].onUpgrade?.(statusCode, headers, socket);
    };
    onHeaders = (statusCode, _headers, resume) => {
        if (this[kHandlers].onHeaders == null) {
            throw new undici_1.errors.InvalidArgumentError('invalid onHeaders method');
        }
        const headers = (0, convert_to_headers_object_1.convertToHeadersObject)(_headers);
        (0, save_cookies_from_header_1.saveCookiesFromHeader)({
            cookieOptions: this[kCookieOptions],
            cookies: headers['set-cookie'],
            requestUrl: this[kRequestUrl],
        });
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this[kHandlers].onHeaders(statusCode, _headers, resume);
    };
    onData = (chunk) => {
        if (this[kHandlers].onData == null) {
            throw new undici_1.errors.InvalidArgumentError('invalid onData method');
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this[kHandlers].onData(chunk);
    };
    onComplete = (trailers) => {
        this[kHandlers].onComplete?.(trailers);
    };
    onBodySent = (chunkSize, totalBytesSent) => {
        this[kHandlers].onBodySent?.(chunkSize, totalBytesSent);
    };
}
exports.CookieHandler = CookieHandler;
