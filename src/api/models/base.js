'use strict';
var APIError = require('../errors/APIError');

module.exports = class BaseDice {
    constructor(proxy){
        this.proxy = proxy;
    }
    async resetseed(req) {
        let errs = new Error('Platform is not support reset seed');
        errs.value = 'Platform is not support reset seed';
        throw new APIError('Platform is not support reset seed' ,errs);
        //return true;
    }

    async donate(req) {
        let errs = new Error('Platform is not support Donate');
        errs.value = 'Platform is not support Donate';
        throw new APIError('Platform is not support Donate' ,errs);
        //return true;
    }
}
