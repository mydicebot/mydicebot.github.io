'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _detectNode = require('detect-node');

var _detectNode2 = _interopRequireDefault(_detectNode);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var WebSocket = void 0;
if (_detectNode2.default) {
  WebSocket = require('ws'); // eslint-disable-line global-require
} else if (typeof window !== 'undefined') {
  WebSocket = window.WebSocket;
} else {
  throw new Error("Couldn't decide on a `WebSocket` class");
}

var debug = (0, _debug2.default)('steem:ws');

var WsTransport = function (_Transport) {
  _inherits(WsTransport, _Transport);

  function WsTransport() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, WsTransport);

    var _this = _possibleConstructorReturn(this, (WsTransport.__proto__ || Object.getPrototypeOf(WsTransport)).call(this, Object.assign({ id: 0 }, options)));

    _this._requests = new Map();
    _this.inFlight = 0;
    _this.isOpen = false;
    return _this;
  }

  _createClass(WsTransport, [{
    key: 'start',
    value: function start() {
      var _this2 = this;

      if (this.startPromise) {
        return this.startPromise;
      }

      this.startPromise = new _bluebird2.default(function (resolve, reject) {
        _this2.ws = new WebSocket(_this2.options.websocket);
        _this2.ws.onerror = function (err) {
          _this2.startPromise = null;
          reject(err);
        };
        _this2.ws.onopen = function () {
          _this2.isOpen = true;
          _this2.ws.onerror = _this2.onError.bind(_this2);
          _this2.ws.onmessage = _this2.onMessage.bind(_this2);
          _this2.ws.onclose = _this2.onClose.bind(_this2);
          resolve();
        };
      });
      return this.startPromise;
    }
  }, {
    key: 'stop',
    value: function stop() {
      debug('Stopping...');

      this.startPromise = null;
      this.isOpen = false;
      this._requests.clear();

      if (this.ws) {
        this.ws.onerror = this.ws.onmessage = this.ws.onclose = null;
        this.ws.close();
        this.ws = null;
      }
    }
  }, {
    key: 'send',
    value: function send(api, data, callback) {
      var _this3 = this;

      debug('Steem::send', api, data);
      return this.start().then(function () {
        var deferral = {};
        new _bluebird2.default(function (resolve, reject) {
          deferral.resolve = function (val) {
            resolve(val);
            callback(null, val);
          };
          deferral.reject = function (val) {
            reject(val);
            callback(val);
          };
        });

        if (_this3.options.useAppbaseApi) {
          api = 'condenser_api';
        }

        var _request = {
          deferral: deferral,
          startedAt: Date.now(),
          message: {
            id: data.id || _this3.id++,
            method: 'call',
            jsonrpc: '2.0',
            params: [api, data.method, data.params]
          }
        };
        _this3.inFlight++;
        _this3._requests.set(_request.message.id, _request);
        _this3.ws.send(JSON.stringify(_request.message));
        return deferral;
      });
    }
  }, {
    key: 'onError',
    value: function onError(error) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this._requests[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _request = _step.value;

          _request.deferral.reject(error);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      this.stop();
    }
  }, {
    key: 'onClose',
    value: function onClose() {
      var error = new Error('Connection was closed');
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this._requests[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _request = _step2.value;

          _request.deferral.reject(error);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      this._requests.clear();
    }
  }, {
    key: 'onMessage',
    value: function onMessage(websocketMessage) {
      var message = JSON.parse(websocketMessage.data);
      debug('-- Steem.onMessage -->', message.id);
      if (!this._requests.has(message.id)) {
        throw new Error('Panic: no request in queue for message id ' + message.id);
      }
      var _request = this._requests.get(message.id);
      this._requests.delete(message.id);

      var errorCause = message.error;
      if (errorCause) {
        var err = new Error(
        // eslint-disable-next-line prefer-template
        (errorCause.message || 'Failed to complete operation') + ' (see err.payload for the full error payload)');
        err.payload = message;
        _request.deferral.reject(err);
      } else {
        this.emit('track-performance', _request.message.method, Date.now() - _request.startedAt);
        _request.deferral.resolve(message.result);
      }
    }
  }]);

  return WsTransport;
}(_base2.default);

exports.default = WsTransport;