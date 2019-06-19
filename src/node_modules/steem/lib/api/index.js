'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _methods = require('./methods');

var _methods2 = _interopRequireDefault(_methods);

var _transports = require('./transports');

var _transports2 = _interopRequireDefault(_transports);

var _utils = require('../utils');

var _ecc = require('../auth/ecc');

var _serializer = require('../auth/serializer');

var _http = require('./transports/http');

var _rpcAuth = require('@steemit/rpc-auth');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Steem = function (_EventEmitter) {
    _inherits(Steem, _EventEmitter);

    function Steem() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, Steem);

        var _this = _possibleConstructorReturn(this, (Steem.__proto__ || Object.getPrototypeOf(Steem)).call(this, options));

        _this._setTransport(options);
        _this._setLogger(options);
        _this.options = options;
        _this.seqNo = 0; // used for rpc calls
        _methods2.default.forEach(function (method) {
            var methodName = method.method_name || (0, _utils.camelCase)(method.method);
            var methodParams = method.params || [];

            _this[methodName + 'With'] = function (options, callback) {
                return _this.send(method.api, {
                    method: method.method,
                    params: methodParams.map(function (param) {
                        return options[param];
                    })
                }, callback);
            };

            _this[methodName] = function () {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                var options = methodParams.reduce(function (memo, param, i) {
                    memo[param] = args[i]; // eslint-disable-line no-param-reassign
                    return memo;
                }, {});
                var callback = args[methodParams.length];
                return _this[methodName + 'With'](options, callback);
            };

            _this[methodName + 'WithAsync'] = _bluebird2.default.promisify(_this[methodName + 'With']);
            _this[methodName + 'Async'] = _bluebird2.default.promisify(_this[methodName]);
        });
        _this.callAsync = _bluebird2.default.promisify(_this.call);
        _this.signedCallAsync = _bluebird2.default.promisify(_this.signedCall);
        return _this;
    }

    _createClass(Steem, [{
        key: '_setTransport',
        value: function _setTransport(options) {
            if (options.url && options.url.match('^((http|https)?:\/\/)')) {
                options.uri = options.url;
                options.transport = 'http';
                this._transportType = options.transport;
                this.options = options;
                this.transport = new _transports2.default.http(options);
            } else if (options.url && options.url.match('^((ws|wss)?:\/\/)')) {
                options.websocket = options.url;
                options.transport = 'ws';
                this._transportType = options.transport;
                this.options = options;
                this.transport = new _transports2.default.ws(options);
            } else if (options.transport) {
                if (this.transport && this._transportType !== options.transport) {
                    this.transport.stop();
                }

                this._transportType = options.transport;

                if (typeof options.transport === 'string') {
                    if (!_transports2.default[options.transport]) {
                        throw new TypeError('Invalid `transport`, valid values are `http`, `ws` or a class');
                    }
                    this.transport = new _transports2.default[options.transport](options);
                } else {
                    this.transport = new options.transport(options);
                }
            } else {
                this.transport = new _transports2.default.ws(options);
            }
        }
    }, {
        key: '_setLogger',
        value: function _setLogger(options) {
            if (options.hasOwnProperty('logger')) {
                switch (_typeof(options.logger)) {
                    case 'function':
                        this.__logger = {
                            log: options.logger
                        };
                        break;
                    case 'object':
                        if (typeof options.logger.log !== 'function') {
                            throw new Error('setOptions({logger:{}}) must have a property .log of type function');
                        }
                        this.__logger = options.logger;
                        break;
                    case 'undefined':
                        if (this.__logger) break;
                    default:
                        this.__logger = false;
                }
            }
        }
    }, {
        key: 'log',
        value: function log(logLevel) {
            if (this.__logger) {
                if (arguments.length > 1 && typeof this.__logger[logLevel] === 'function') {
                    var args = Array.prototype.slice.call(arguments, 1);
                    this.__logger[logLevel].apply(this.__logger, args);
                } else {
                    this.__logger.log.apply(this.__logger, arguments);
                }
            }
        }
    }, {
        key: 'start',
        value: function start() {
            return this.transport.start();
        }
    }, {
        key: 'stop',
        value: function stop() {
            return this.transport.stop();
        }
    }, {
        key: 'send',
        value: function send(api, data, callback) {
            var cb = callback;
            if (this.__logger) {
                var id = Math.random();
                var self = this;
                this.log('xmit:' + id + ':', data);
                cb = function cb(e, d) {
                    if (e) {
                        self.log('error', 'rsp:' + id + ':\n\n', e, d);
                    } else {
                        self.log('rsp:' + id + ':', d);
                    }
                    if (callback) {
                        callback.apply(self, arguments);
                    }
                };
            }
            return this.transport.send(api, data, cb);
        }
    }, {
        key: 'call',
        value: function call(method, params, callback) {
            if (this._transportType !== 'http') {
                callback(new Error('RPC methods can only be called when using http transport'));
                return;
            }
            var id = ++this.seqNo;
            (0, _http.jsonRpc)(this.options.uri, { method: method, params: params, id: id }).then(function (res) {
                callback(null, res);
            }, function (err) {
                callback(err);
            });
        }
    }, {
        key: 'signedCall',
        value: function signedCall(method, params, account, key, callback) {
            if (this._transportType !== 'http') {
                callback(new Error('RPC methods can only be called when using http transport'));
                return;
            }
            var id = ++this.seqNo;
            var request = void 0;
            try {
                request = (0, _rpcAuth.sign)({ method: method, params: params, id: id }, account, [key]);
            } catch (error) {
                callback(error);
                return;
            }
            (0, _http.jsonRpc)(this.options.uri, request).then(function (res) {
                callback(null, res);
            }, function (err) {
                callback(err);
            });
        }
    }, {
        key: 'setOptions',
        value: function setOptions(options) {
            Object.assign(this.options, options);
            this._setLogger(options);
            this._setTransport(options);
            this.transport.setOptions(options);
        }
    }, {
        key: 'setWebSocket',
        value: function setWebSocket(url) {
            this.setOptions({
                websocket: url
            });
        }
    }, {
        key: 'setUri',
        value: function setUri(url) {
            this.setOptions({
                uri: url
            });
        }
    }, {
        key: 'streamBlockNumber',
        value: function streamBlockNumber() {
            var mode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'head';

            var _this2 = this;

            var callback = arguments[1];
            var ts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 200;

            if (typeof mode === 'function') {
                callback = mode;
                mode = 'head';
            }
            var current = '';
            var running = true;

            var update = function update() {
                if (!running) return;

                _this2.getDynamicGlobalPropertiesAsync().then(function (result) {
                    var blockId = mode === 'irreversible' ? result.last_irreversible_block_num : result.head_block_number;

                    if (blockId !== current) {
                        if (current) {
                            for (var i = current; i < blockId; i++) {
                                if (i !== current) {
                                    callback(null, i);
                                }
                                current = i;
                            }
                        } else {
                            current = blockId;
                            callback(null, blockId);
                        }
                    }

                    _bluebird2.default.delay(ts).then(function () {
                        update();
                    });
                }, function (err) {
                    callback(err);
                });
            };

            update();

            return function () {
                running = false;
            };
        }
    }, {
        key: 'streamBlock',
        value: function streamBlock() {
            var _this3 = this;

            var mode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'head';
            var callback = arguments[1];

            if (typeof mode === 'function') {
                callback = mode;
                mode = 'head';
            }

            var current = '';
            var last = '';

            var release = this.streamBlockNumber(mode, function (err, id) {
                if (err) {
                    release();
                    callback(err);
                    return;
                }

                current = id;
                if (current !== last) {
                    last = current;
                    _this3.getBlock(current, callback);
                }
            });

            return release;
        }
    }, {
        key: 'streamTransactions',
        value: function streamTransactions() {
            var mode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'head';
            var callback = arguments[1];

            if (typeof mode === 'function') {
                callback = mode;
                mode = 'head';
            }

            var release = this.streamBlock(mode, function (err, result) {
                if (err) {
                    release();
                    callback(err);
                    return;
                }

                if (result && result.transactions) {
                    result.transactions.forEach(function (transaction) {
                        callback(null, transaction);
                    });
                }
            });

            return release;
        }
    }, {
        key: 'streamOperations',
        value: function streamOperations() {
            var mode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'head';
            var callback = arguments[1];

            if (typeof mode === 'function') {
                callback = mode;
                mode = 'head';
            }

            var release = this.streamTransactions(mode, function (err, transaction) {
                if (err) {
                    release();
                    callback(err);
                    return;
                }

                transaction.operations.forEach(function (operation) {
                    callback(null, operation);
                });
            });

            return release;
        }
    }, {
        key: 'broadcastTransactionSynchronousWith',
        value: function broadcastTransactionSynchronousWith(options, callback) {
            var trx = options.trx;
            return this.send('network_broadcast_api', {
                method: 'broadcast_transaction_synchronous',
                params: [trx]
            }, function (err, result) {
                if (err) {
                    var signed_transaction = _serializer.ops.signed_transaction;
                    // console.log('-- broadcastTransactionSynchronous -->', JSON.stringify(signed_transaction.toObject(trx), null, 2));
                    // toObject converts objects into serializable types

                    var trObject = signed_transaction.toObject(trx);
                    var buf = signed_transaction.toBuffer(trx);
                    err.digest = _ecc.hash.sha256(buf).toString('hex');
                    err.transaction_id = buf.toString('hex');
                    err.transaction = JSON.stringify(trObject);
                    callback(err, '');
                } else {
                    callback('', result);
                }
            });
        }
    }]);

    return Steem;
}(_events2.default);

// Export singleton instance


var steem = new Steem(_config2.default);
exports = module.exports = steem;
exports.Steem = Steem;