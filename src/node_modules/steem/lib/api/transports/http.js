'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.jsonRpc = jsonRpc;

var _crossFetch = require('cross-fetch');

var _crossFetch2 = _interopRequireDefault(_crossFetch);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _retry = require('retry');

var _retry2 = _interopRequireDefault(_retry);

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var debug = (0, _debug2.default)('steem:http');

var RPCError = function (_Error) {
  _inherits(RPCError, _Error);

  function RPCError(rpcError) {
    _classCallCheck(this, RPCError);

    var _this = _possibleConstructorReturn(this, (RPCError.__proto__ || Object.getPrototypeOf(RPCError)).call(this, rpcError.message));

    _this.name = 'RPCError';
    _this.code = rpcError.code;
    _this.data = rpcError.data;
    return _this;
  }

  return RPCError;
}(Error);

/**
 * Makes a JSON-RPC request using `fetch` or a user-provided `fetchMethod`.
 *
 * @param {string} uri - The URI to the JSON-RPC endpoint.
 * @param {string} options.method - The remote JSON-RPC method to call.
 * @param {string} options.id - ID for the request, for matching to a response.
 * @param {*} options.params  - The params for the remote method.
 * @param {function} [options.fetchMethod=fetch] - A function with the same
 * signature as `fetch`, which can be used to make the network request, or for
 * stubbing in tests.
 */


function jsonRpc(uri, _ref) {
  var method = _ref.method,
      id = _ref.id,
      params = _ref.params,
      _ref$fetchMethod = _ref.fetchMethod,
      fetchMethod = _ref$fetchMethod === undefined ? _crossFetch2.default : _ref$fetchMethod;

  var payload = { id: id, jsonrpc: '2.0', method: method, params: params };
  return fetchMethod(uri, {
    body: JSON.stringify(payload),
    method: 'post',
    mode: 'cors',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    }
  }).then(function (res) {
    if (!res.ok) {
      throw new Error('HTTP ' + res.status + ': ' + res.statusText);
    }
    return res.json();
  }).then(function (rpcRes) {
    if (rpcRes.id !== id) {
      throw new Error('Invalid response id: ' + rpcRes.id);
    }
    if (rpcRes.error) {
      throw new RPCError(rpcRes.error);
    }
    return rpcRes.result;
  });
}

var HttpTransport = function (_Transport) {
  _inherits(HttpTransport, _Transport);

  function HttpTransport() {
    _classCallCheck(this, HttpTransport);

    return _possibleConstructorReturn(this, (HttpTransport.__proto__ || Object.getPrototypeOf(HttpTransport)).apply(this, arguments));
  }

  _createClass(HttpTransport, [{
    key: 'send',
    value: function send(api, data, callback) {
      var _this3 = this;

      if (this.options.useAppbaseApi) {
        api = 'condenser_api';
      }
      debug('Steem::send', api, data);
      var id = data.id || this.id++;
      var params = [api, data.method, data.params];
      var retriable = this.retriable(api, data);
      var fetchMethod = this.options.fetchMethod;
      if (retriable) {
        retriable.attempt(function (currentAttempt) {
          jsonRpc(_this3.options.uri, { method: 'call', id: id, params: params, fetchMethod: fetchMethod }).then(function (res) {
            callback(null, res);
          }, function (err) {
            if (retriable.retry(err)) {
              return;
            }
            callback(retriable.mainError());
          });
        });
      } else {
        jsonRpc(this.options.uri, { method: 'call', id: id, params: params, fetchMethod: fetchMethod }).then(function (res) {
          callback(null, res);
        }, function (err) {
          callback(err);
        });
      }
    }
  }, {
    key: 'retriable',


    // An object which can be used to track retries.
    value: function retriable(api, data) {
      if (this.nonRetriableOperations.some(function (o) {
        return o === data.method;
      })) {
        // Do not retry if the operation is non-retriable.
        return null;
      } else if (Object(this.options.retry) === this.options.retry) {
        // If `this.options.retry` is a map of options, pass those to operation.
        return _retry2.default.operation(this.options.retry);
      } else if (this.options.retry) {
        // If `this.options.retry` is `true`, use default options.
        return _retry2.default.operation();
      } else {
        // Otherwise, don't retry.
        return null;
      }
    }
  }, {
    key: 'nonRetriableOperations',
    get: function get() {
      return this.options.nonRetriableOperations || ['broadcast_transaction', 'broadcast_transaction_with_callback', 'broadcast_transaction_synchronous', 'broadcast_block'];
    }
  }]);

  return HttpTransport;
}(_base2.default);

exports.default = HttpTransport;