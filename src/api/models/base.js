'use strict';
var APIError = require('../errors/APIError');

module.exports = class BaseDice {
    constructor(){
        //console.log('mydicebot');
    }
    async resetseed(req) {
        let errs = new Error('Platform is not support reset seed');
        errs.value = 'Platform is not support reset seed';
        throw new APIError('Platform is not support reset seed' ,errs);
        //return true;
    }
}
