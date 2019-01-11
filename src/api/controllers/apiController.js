'use strict';

import {Factory} from '../models/factory'
import {APIError} from '../errors/APIError';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

exports.index = function(req, res) {
    res.render('index', { title: 'My Dice Bot' });
};

exports.login = async function(req, res) {
    try{
        console.log(req.body.site);
        if(typeof req.body.username !== 'undefined'){
            let dice = Factory.create(req.body.site);
            let ret = await dice.login(req.body.username, req.body.password, req.body.twofa, req.body.apikey, req);
            if(ret != true){
                res.render('login', {message:ret});
            } else {
                res.redirect(req.protocol+"://"+req.headers.host+'/'+req.body.site+'/info');
            }
        } else {
            res.render('login');
        }
    } catch(err) {
        console.log(err);
        res.render('login', {message:err.toString()});
    }
};

exports.info = async function(req, res) {
    try{
        let dice = Factory.create(req.params.site);
        let ret = await dice.getUserInfo(req);
        res.render('info', {site: '../js/'+req.params.site+'/info.js'});
    } catch(err) {
        console.log(err);
        res.render('error',{err: err.toString()});
    }
};

exports.bet = async function(req, res) {
    try{
        let dice = Factory.create(req.params.site);
        let ret = await dice.bet(req);
        return res.status(200).json(ret);
    } catch(err) {
        console.log(err);
        return res.status(200).json({err: err.toString()});
    }
};

exports.refresh = async function(req, res) {
    try{
        let dice = Factory.create(req.params.site);
        let ret = await dice.refresh(req);
        return res.status(200).json(ret);
    } catch(err) {
        console.log(err);
        res.render('error',{err: err.toString()});
    }
};

exports.clear = async function(req, res) {
    try{
        let dice = Factory.create(req.params.site);
        let ret = await dice.clear(req);
        return res.status(200).json(ret);
    } catch(err) {
        console.log(err);
        res.render('error',{err: err.toString()});
    }
};

exports.save = async function(req, res) {
    try{
        let content = req.body.scriptStr;
        let fileName = req.body.fileName;
        //let filePath = path.resolve(path.join(__dirname, '../../script/lua/')+fileName);
        let filePath = path.resolve(path.join(process.execPath, '../script/lua/')+fileName);
        let str  = await writeFile(filePath, content);
        return res.status(200).json(str);
    } catch(err) {
        console.log(err);
        res.render('error',{err: err.toString()});
    }
};

exports.file = async function(req, res) {
    try{
        //let filePath = path.resolve(path.join(__dirname, '../../script/lua/')+req.query.file);
        let filePath = path.resolve(path.join(process.execPath, '../script/lua/')+req.query.file);
        let content  = await readFile(filePath);
        return res.status(200).json(content);
    } catch(err) {
        console.log(err);
        res.render('error',{err: err.toString()});
    }
};

exports.script = async function(req, res) {
    try{
        //let filePath = path.resolve(path.join(__dirname, '../../script/lua/'));
        let filePath = path.resolve(path.join(process.execPath, '../script/lua/'));
        let paths = await getFiles(filePath);
        return res.status(200).json(paths);
    } catch(err) {
        console.log(err);
        res.render('error',{err: err.toString()});
    }
};

exports.del = async function(req, res) {
    try{
        //let filePath = path.resolve(path.join(__dirname, '../../script/lua/')+req.query.file);
        let filePath = path.resolve(path.join(process.execPath, '../script/lua/')+req.query.file);
        fs.unlinkSync(filePath);
        return res.status(200).json('ok');
    } catch(err) {
        console.log(err);
        res.render('error',{err: err.toString()});
    }
};

exports.upload = async function(req, res) {
    try{
        let form = new formidable.IncomingForm();
        form.parse(req, function(error, fields, files) {
            //let filePath = path.resolve(path.join(__dirname, '../../script/lua/')+files.upload.name);
            let filePath = path.resolve(path.join(process.execPath, '../script/lua/')+files.upload.name);
            fs.writeFileSync(filePath, fs.readFileSync(files.upload.path));
            return res.status(200).json('ok');
        });
    } catch(err) {
        console.log(err);
        res.render('error',{err: err.toString()});
    }
};

async function getFiles(filePath){
    let paths = [];
    return new Promise(( resolve, reject ) => {
        fs.readdir(filePath,function(err,files){
            if(err) {
                reject( err );
                return;
            }
            if(typeof files !== 'undefined') {
                files.forEach(function(filename){
                    if(path.extname(filename).toLowerCase() == '.lua') {
                        paths.push(filename);
                    }
                });
                resolve(paths);
            } else {
                resolve('');
            }
        });
    });
}

async function readFile(filePath){
    let buf = new Buffer.alloc(1024*10);
    return new Promise(( resolve, reject ) => {
        fs.open(filePath, 'r+', function(err, fd) {
            if (err) {
                reject( err );
                return;
            }
            fs.read(fd, buf, 0, buf.length, 0, function(err, bytes){
                if (err){
                    reject( err );
                    return;
                }
                if(bytes > 0){
                    resolve(buf.slice(0, bytes).toString());
                }
            });
        });
    });
}

async function writeFile(filePath, content){
    return new Promise(( resolve, reject ) => {
        fs.writeFile(filePath, content, function(err) {
            if(err) {
                reject( err );
                return;
            }
            resolve("ok");
        });
    });
}
