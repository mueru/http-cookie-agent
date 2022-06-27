"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HttpCookieAgent = void 0;

var _http = _interopRequireDefault(require("http"));

var _create_cookie_agent = require("./create_cookie_agent");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const HttpCookieAgent = (0, _create_cookie_agent.createCookieAgent)(_http.default.Agent);
exports.HttpCookieAgent = HttpCookieAgent;