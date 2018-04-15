var url = require('url');
var crypto = require('crypto');
var request = require('request');
var async = require('async');
var BufferHelp = require('bufferhelper');
var iconv = require('iconv-lite');
var fs = require('fs');

var path = require('path')
var config = require('../config')()
var tokenPath = path.join(__dirname,'../tmp/token.json');
var ticketPath = path.join(__dirname,'../tmp/ticket.json')



function getNewToken(config, cb) {
    var tokenUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appId=' + config.appId + '&secret=' + config.appSecret;

    request.get(tokenUrl, function(error, response, body) {
        if (error) {
            cb('getToken error', error);
        }
        else {
            try {
                var token = JSON.parse(body).access_token;
                cb(null, token);
            }
            catch (e) {
                cb('getToken error', e);
            }
        }
    });
}



function getToken(config, cb) {
    readFile(tokenPath,function(result){ 
        if((JSON.parse(result||"{}").time||0)+7000000<(+new Date())){
            getNewToken(config,function(err,data){
                let obj = {}
                obj.token = data;
                obj.time = new Date().getTime();
                // 文件保存
                writeFile(tokenPath, JSON.stringify(obj));
                cb(null,data)
            })
        }else{
            console.log("未过期从缓存中获取")
            cb(null,result)
        }
    })
}

function getNewTicket(token, cb) {
    request.get('https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + token + '&type=jsapi', function(error, res, body) {
        if (error) {
            cb('getNewTicket error', error);
        }
        else {
            try {
                console.log(JSON.parse(body));
                var ticket = JSON.parse(body).ticket;
                cb(null, ticket);
            }
            catch (e) {
                cb('getNewTicket error', e);
            }
        }
    });
}


function getTicket(config, cb) {
    readFile(ticketPath, function (result) {
        if ((JSON.parse(result || "{}").time || 0) + 7000000 < (+new Date())) {
            console.log("111111111")
            getToken(config, function (err, token) {
                getNewTicket(token, function(err,data){
                    let obj = {}
                    obj.ticket = data;
                    obj.time = new Date().getTime();
                    // 文件保存
                    writeFile(ticketPath, JSON.stringify(obj));
                    cb(null,data)
                }) 
            })
        } else {
            console.log("未过期从缓存中获取")
            cb(null, result)
        }
    })
}




// getToken(config,function(err,data){
//     console.log(data)
// })
getTicket(config,function(err,data){
    console.log(data)
})









function getTimesTamp() {
    return parseInt(new Date().getTime() / 1000) + '';
}

function getNonceStr() {
    return Math.random().toString(36).substr(2, 15);
}


function readFile(path, cb) {
    var readstream = fs.createReadStream(path);
    var bf = new BufferHelp();
    readstream.on('data', function(chunk) {
        bf.concat(chunk);
    });
    readstream.on('end', function() {
        cb && cb(decodeBuffer(bf));
    });
}

function writeFile(path, str, cb) {
    var writestream = fs.createWriteStream(path);

    writestream.write(str);
    writestream.on('close', function() {
        cb && cb();
    });
}

function decodeBuffer(bf, encoding) {
    var val = iconv.decode(bf.toBuffer(), encoding || 'utf8');
    if (val.indexOf('�') != -1) {
        val = iconv.decode(bf.toBuffer(), 'gbk');
    }
    return val;
}
