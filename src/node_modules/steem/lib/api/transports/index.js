'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _http = require('./http');

var _http2 = _interopRequireDefault(_http);

var _ws = require('./ws');

var _ws2 = _interopRequireDefault(_ws);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  http: _http2.default,
  ws: _ws2.default
};