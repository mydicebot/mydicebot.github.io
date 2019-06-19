"use strict";

var api = require("./api");
var auth = require("./auth");
var broadcast = require("./broadcast");
var config = require("./config");
var formatter = require("./formatter")(api);
var utils = require("./utils");

var steem = {
  api: api,
  auth: auth,
  broadcast: broadcast,
  config: config,
  formatter: formatter,
  utils: utils
};

if (typeof window !== "undefined") {
  window.steem = steem;
}

if (typeof global !== "undefined") {
  global.steem = steem;
}

exports = module.exports = steem;