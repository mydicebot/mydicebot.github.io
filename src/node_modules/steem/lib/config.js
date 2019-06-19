'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _each = require('lodash/each');

var _each2 = _interopRequireDefault(_each);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultConfig = require('../config.json');

var Config = function () {
  function Config(c) {
    var _this = this;

    _classCallCheck(this, Config);

    (0, _each2.default)(c, function (value, key) {
      _this[key] = value;
    });
  }

  _createClass(Config, [{
    key: 'get',
    value: function get(k) {
      return this[k];
    }
  }, {
    key: 'set',
    value: function set(k, v) {
      this[k] = v;
    }
  }]);

  return Config;
}();

module.exports = new Config(defaultConfig);
if (typeof module.exports.Config !== 'undefined') {
  throw new Error("default config.json file may not contain a property 'Config'");
}
module.exports.Config = Config;