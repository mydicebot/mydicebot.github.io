"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _get = require("lodash/get");

var _get2 = _interopRequireDefault(_get);

var _ecc = require("./auth/ecc");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (steemAPI) {
  function numberWithCommas(x) {
    return x.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function vestingSteem(account, gprops) {
    var vests = parseFloat(account.vesting_shares.split(" ")[0]);
    var total_vests = parseFloat(gprops.total_vesting_shares.split(" ")[0]);
    var total_vest_steem = parseFloat(gprops.total_vesting_fund_steem.split(" ")[0]);
    var vesting_steemf = total_vest_steem * (vests / total_vests);
    return vesting_steemf;
  }

  function processOrders(open_orders, assetPrecision) {
    var sbdOrders = !open_orders ? 0 : open_orders.reduce(function (o, order) {
      if (order.sell_price.base.indexOf("SBD") !== -1) {
        o += order.for_sale;
      }
      return o;
    }, 0) / assetPrecision;

    var steemOrders = !open_orders ? 0 : open_orders.reduce(function (o, order) {
      if (order.sell_price.base.indexOf("STEEM") !== -1) {
        o += order.for_sale;
      }
      return o;
    }, 0) / assetPrecision;

    return { steemOrders: steemOrders, sbdOrders: sbdOrders };
  }

  function calculateSaving(savings_withdraws) {
    var savings_pending = 0;
    var savings_sbd_pending = 0;
    savings_withdraws.forEach(function (withdraw) {
      var _withdraw$amount$spli = withdraw.amount.split(" "),
          _withdraw$amount$spli2 = _slicedToArray(_withdraw$amount$spli, 2),
          amount = _withdraw$amount$spli2[0],
          asset = _withdraw$amount$spli2[1];

      if (asset === "STEEM") savings_pending += parseFloat(amount);else {
        if (asset === "SBD") savings_sbd_pending += parseFloat(amount);
      }
    });
    return { savings_pending: savings_pending, savings_sbd_pending: savings_sbd_pending };
  }

  function pricePerSteem(feed_price) {
    var price_per_steem = undefined;
    var base = feed_price.base,
        quote = feed_price.quote;

    if (/ SBD$/.test(base) && / STEEM$/.test(quote)) {
      price_per_steem = parseFloat(base.split(" ")[0]) / parseFloat(quote.split(" ")[0]);
    }
    return price_per_steem;
  }

  function estimateAccountValue(account) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        gprops = _ref.gprops,
        feed_price = _ref.feed_price,
        open_orders = _ref.open_orders,
        savings_withdraws = _ref.savings_withdraws,
        vesting_steem = _ref.vesting_steem;

    var promises = [];
    var username = account.name;
    var assetPrecision = 1000;
    var orders = void 0,
        savings = void 0;

    if (!vesting_steem || !feed_price) {
      if (!gprops || !feed_price) {
        promises.push(steemAPI.getStateAsync("/@" + username).then(function (data) {
          gprops = data.props;
          feed_price = data.feed_price;
          vesting_steem = vestingSteem(account, gprops);
        }));
      } else {
        vesting_steem = vestingSteem(account, gprops);
      }
    }

    if (!open_orders) {
      promises.push(steemAPI.getOpenOrdersAsync(username).then(function (open_orders) {
        orders = processOrders(open_orders, assetPrecision);
      }));
    } else {
      orders = processOrders(open_orders, assetPrecision);
    }

    if (!savings_withdraws) {
      promises.push(steemAPI.getSavingsWithdrawFromAsync(username).then(function (savings_withdraws) {
        savings = calculateSaving(savings_withdraws);
      }));
    } else {
      savings = calculateSaving(savings_withdraws);
    }

    return Promise.all(promises).then(function () {
      var price_per_steem = pricePerSteem(feed_price);

      var savings_balance = account.savings_balance;
      var savings_sbd_balance = account.savings_sbd_balance;
      var balance_steem = parseFloat(account.balance.split(" ")[0]);
      var saving_balance_steem = parseFloat(savings_balance.split(" ")[0]);
      var sbd_balance = parseFloat(account.sbd_balance);
      var sbd_balance_savings = parseFloat(savings_sbd_balance.split(" ")[0]);

      var conversionValue = 0;
      var currentTime = new Date().getTime();
      (account.other_history || []).reduce(function (out, item) {
        if ((0, _get2.default)(item, [1, "op", 0], "") !== "convert") return out;

        var timestamp = new Date((0, _get2.default)(item, [1, "timestamp"])).getTime();
        var finishTime = timestamp + 86400000 * 3.5; // add 3.5day conversion delay
        if (finishTime < currentTime) return out;

        var amount = parseFloat((0, _get2.default)(item, [1, "op", 1, "amount"]).replace(" SBD", ""));
        conversionValue += amount;
      }, []);

      var total_sbd = sbd_balance + sbd_balance_savings + savings.savings_sbd_pending + orders.sbdOrders + conversionValue;

      var total_steem = vesting_steem + balance_steem + saving_balance_steem + savings.savings_pending + orders.steemOrders;

      return (total_steem * price_per_steem + total_sbd).toFixed(2);
    });
  }

  function createSuggestedPassword() {
    var PASSWORD_LENGTH = 32;
    var privateKey = _ecc.key_utils.get_random_key();
    return privateKey.toWif().substring(3, 3 + PASSWORD_LENGTH);
  }

  return {
    reputation: function reputation(_reputation) {
      if (_reputation == null) return _reputation;
      _reputation = parseInt(_reputation);
      var rep = String(_reputation);
      var neg = rep.charAt(0) === "-";
      rep = neg ? rep.substring(1) : rep;
      var str = rep;
      var leadingDigits = parseInt(str.substring(0, 4));
      var log = Math.log(leadingDigits) / Math.log(10);
      var n = str.length - 1;
      var out = n + (log - parseInt(log));
      if (isNaN(out)) out = 0;
      out = Math.max(out - 9, 0);
      out = (neg ? -1 : 1) * out;
      out = out * 9 + 25;
      out = parseInt(out);
      return out;
    },

    vestToSteem: function vestToSteem(vestingShares, totalVestingShares, totalVestingFundSteem) {
      return parseFloat(totalVestingFundSteem) * (parseFloat(vestingShares) / parseFloat(totalVestingShares));
    },

    commentPermlink: function commentPermlink(parentAuthor, parentPermlink) {
      var timeStr = new Date().toISOString().replace(/[^a-zA-Z0-9]+/g, "").toLowerCase();
      parentPermlink = parentPermlink.replace(/(-\d{8}t\d{9}z)/g, "");
      return "re-" + parentAuthor + "-" + parentPermlink + "-" + timeStr;
    },

    amount: function amount(_amount, asset) {
      return _amount.toFixed(3) + " " + asset;
    },
    numberWithCommas: numberWithCommas,
    vestingSteem: vestingSteem,
    estimateAccountValue: estimateAccountValue,
    createSuggestedPassword: createSuggestedPassword,
    pricePerSteem: pricePerSteem
  };
};