"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HttpsCookieAgent = void 0;

var _https = _interopRequireDefault(require("https"));

var _create_cookie_agent = require("./create_cookie_agent");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const HttpsCookieAgent = (0, _create_cookie_agent.createCookieAgent)(_https.default.Agent);
exports.HttpsCookieAgent = HttpsCookieAgent;