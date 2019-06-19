'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _api = require('../api');

var _api2 = _interopRequireDefault(_api);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports = module.exports = function (steemBroadcast) {
  steemBroadcast.addAccountAuth = function (_ref, cb) {
    var signingKey = _ref.signingKey,
        username = _ref.username,
        authorizedUsername = _ref.authorizedUsername,
        _ref$role = _ref.role,
        role = _ref$role === undefined ? 'posting' : _ref$role,
        weight = _ref.weight;

    _api2.default.getAccounts([username], function (err, _ref2) {
      var _ref3 = _slicedToArray(_ref2, 1),
          userAccount = _ref3[0];

      if (err) {
        return cb(new Error(err), null);
      }
      if (!userAccount) {
        return cb(new Error('Invalid account name'), null);
      }

      var updatedAuthority = userAccount[role];

      /** Release callback if the account already exist in the account_auths array */
      var authorizedAccounts = updatedAuthority.account_auths.map(function (auth) {
        return auth[0];
      });
      var hasAuthority = authorizedAccounts.indexOf(authorizedUsername) !== -1;
      if (hasAuthority) {
        return cb(null, null);
      }

      /** Use weight_thresold as default weight */
      weight = weight || userAccount[role].weight_threshold;
      updatedAuthority.account_auths.push([authorizedUsername, weight]);
      var owner = role === 'owner' ? updatedAuthority : undefined;
      var active = role === 'active' ? updatedAuthority : undefined;
      var posting = role === 'posting' ? updatedAuthority : undefined;

      /** Add authority on user account */
      steemBroadcast.accountUpdate(signingKey, userAccount.name, owner, active, posting, userAccount.memo_key, userAccount.json_metadata, cb);
    });
  };

  steemBroadcast.removeAccountAuth = function (_ref4, cb) {
    var signingKey = _ref4.signingKey,
        username = _ref4.username,
        authorizedUsername = _ref4.authorizedUsername,
        _ref4$role = _ref4.role,
        role = _ref4$role === undefined ? 'posting' : _ref4$role;

    _api2.default.getAccounts([username], function (err, _ref5) {
      var _ref6 = _slicedToArray(_ref5, 1),
          userAccount = _ref6[0];

      if (err) {
        return cb(new Error(err), null);
      }
      if (!userAccount) {
        return cb(new Error('Invalid account name'), null);
      }

      var updatedAuthority = userAccount[role];
      var totalAuthorizedUser = updatedAuthority.account_auths.length;
      for (var i = 0; i < totalAuthorizedUser; i++) {
        var user = updatedAuthority.account_auths[i];
        if (user[0] === authorizedUsername) {
          updatedAuthority.account_auths.splice(i, 1);
          break;
        }
      }

      /** Release callback if the account does not exist in the account_auths array */
      if (totalAuthorizedUser === updatedAuthority.account_auths.length) {
        return cb(null, null);
      }

      var owner = role === 'owner' ? updatedAuthority : undefined;
      var active = role === 'active' ? updatedAuthority : undefined;
      var posting = role === 'posting' ? updatedAuthority : undefined;

      steemBroadcast.accountUpdate(signingKey, userAccount.name, owner, active, posting, userAccount.memo_key, userAccount.json_metadata, cb);
    });
  };

  steemBroadcast.addKeyAuth = function (_ref7, cb) {
    var signingKey = _ref7.signingKey,
        username = _ref7.username,
        authorizedKey = _ref7.authorizedKey,
        _ref7$role = _ref7.role,
        role = _ref7$role === undefined ? 'posting' : _ref7$role,
        weight = _ref7.weight;

    _api2.default.getAccounts([username], function (err, _ref8) {
      var _ref9 = _slicedToArray(_ref8, 1),
          userAccount = _ref9[0];

      if (err) {
        return cb(new Error(err), null);
      }
      if (!userAccount) {
        return cb(new Error('Invalid account name'), null);
      }

      var updatedAuthority = userAccount[role];

      /** Release callback if the key already exist in the key_auths array */
      var authorizedKeys = updatedAuthority.key_auths.map(function (auth) {
        return auth[0];
      });
      var hasAuthority = authorizedKeys.indexOf(authorizedKey) !== -1;
      if (hasAuthority) {
        return cb(null, null);
      }

      /** Use weight_thresold as default weight */
      weight = weight || userAccount[role].weight_threshold;
      updatedAuthority.key_auths.push([authorizedKey, weight]);
      var owner = role === 'owner' ? updatedAuthority : undefined;
      var active = role === 'active' ? updatedAuthority : undefined;
      var posting = role === 'posting' ? updatedAuthority : undefined;

      /** Add authority on user account */
      steemBroadcast.accountUpdate(signingKey, userAccount.name, owner, active, posting, userAccount.memo_key, userAccount.json_metadata, cb);
    });
  };

  steemBroadcast.removeKeyAuth = function (_ref10, cb) {
    var signingKey = _ref10.signingKey,
        username = _ref10.username,
        authorizedKey = _ref10.authorizedKey,
        _ref10$role = _ref10.role,
        role = _ref10$role === undefined ? 'posting' : _ref10$role;

    _api2.default.getAccounts([username], function (err, _ref11) {
      var _ref12 = _slicedToArray(_ref11, 1),
          userAccount = _ref12[0];

      if (err) {
        return cb(new Error(err), null);
      }
      if (!userAccount) {
        return cb(new Error('Invalid account name'), null);
      }

      var updatedAuthority = userAccount[role];
      var totalAuthorizedKey = updatedAuthority.key_auths.length;
      for (var i = 0; i < totalAuthorizedKey; i++) {
        var user = updatedAuthority.key_auths[i];
        if (user[0] === authorizedKey) {
          updatedAuthority.key_auths.splice(i, 1);
          break;
        }
      }

      /** Release callback if the key does not exist in the key_auths array */
      if (totalAuthorizedKey === updatedAuthority.key_auths.length) {
        return cb(null, null);
      }

      var owner = role === 'owner' ? updatedAuthority : undefined;
      var active = role === 'active' ? updatedAuthority : undefined;
      var posting = role === 'posting' ? updatedAuthority : undefined;

      steemBroadcast.accountUpdate(signingKey, userAccount.name, owner, active, posting, userAccount.memo_key, userAccount.json_metadata, cb);
    });
  };
};