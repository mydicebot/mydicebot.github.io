'use strict';
var APIError = require('../errors/APIError');
var fetch = require('isomorphic-fetch');
var SocksProxyAgent = require('socks-proxy-agent');

module.exports = class GitHub {
    constructor(){
        this.url = 'https://api.github.com';
    }

    async gists(username, start, count) {
        let ret = await this._send('users/'+username+'/gists', 'GET', '', '');
        let gists = [];
        let langs =['JavaScript','Python','Lua'];
        ret.forEach(async function(gist) {
            let ngist = {};
            let isMyDiceBotScript = true;
            ngist.ids = gist.id;
            ngist.desc = gist.description;
            ngist.comments = gist.comments;
            if(ngist.desc.toLowerCase().indexOf("#mydicebot#") < 0){
                isMyDiceBotScript = false;
            }
            let files = gist.files;
            for(var key in files){
                ngist.raw = files[key].raw_url;
                ngist.id = files[key].raw_url;
                ngist.lang = files[key].language;
                if(!langs.includes(ngist.lang)){
                    isMyDiceBotScript = false;
                }
            }
            if(isMyDiceBotScript){
                gists.push(ngist);
            }
        });
        let total = gists.length;
        let tgists = gists.slice(start, start+count);
        for(var n in tgists){
            let url = 'https://gist.github.com/'+username+'/'+tgists[n].ids+'/';
            let content = await this.curl(url, 'GET');
            let regStar = /aria-label="(.+) user[s]? starred this gist/;
            let regFork = /aria-label="(.+) user[s]? forked this gist/;
            let itemStar = regStar.exec(content);
            let itemFork = regFork.exec(content);
            let stars = (itemStar != null && itemStar.length > 0)?itemStar[1] : 0
            tgists[n].stars = stars;
            let forks = (itemFork != null && itemFork.length > 0)?itemFork[1] : 0
            tgists[n].forks = forks;
            tgists[n].gist_url = url;
        }
        return [total,tgists];
    }

    async curl(url, method) {
        let res = await fetch(url, {
            method,
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.116 Safari/537.36',
                'Content-Type': 'application/json',
            },
        });
        let data = await res.text();
        //console.log(data);
        return data;
    }

    async _send(route, method, body, accessToken){
        let url = `${this.url}/${route}`;
        let res = await fetch(url, {
            method,
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.116 Safari/537.36',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        let data = await res.json();
        if(data.message) {
            let errs = new Error(data.message);
            errs.value = data.message;
            throw new APIError(data.message ,errs);
        }
        let ret = data;
        return ret;
    }
}
