'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Transport = function (_EventEmitter) {
  _inherits(Transport, _EventEmitter);

  function Transport() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Transport);

    var _this = _possibleConstructorReturn(this, (Transport.__proto__ || Object.getPrototypeOf(Transport)).call(this, options));

    _this.options = options;
    _this.id = 0;
    return _this;
  }

  _createClass(Transport, [{
    key: 'setOptions',
    value: function setOptions(options) {
      Object.assign(this.options, options);
      this.stop();
    }
  }, {
    key: 'listenTo',
    value: function listenTo(target, eventName, callback) {
      if (target.addEventListener) target.addEventListener(eventName, callback);else target.on(eventName, callback);

      return function () {
        if (target.removeEventListener) target.removeEventListener(eventName, callback);else target.removeListener(eventName, callback);
      };
    }
  }, {
    key: 'send',
    value: function send() {}
  }, {
    key: 'start',
    value: function start() {}
  }, {
    key: 'stop',
    value: function stop() {}
  }]);

  return Transport;
}(_events2.default);

exports.default = Transport;


_bluebird2.default.promisifyAll(Transport.prototype);