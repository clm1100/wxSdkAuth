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
var ticketPath = path.join(__dirname,'../tmp/ticket.json');

function readFile(path) {
    return new Promise(function (resolve, reject) {
        var readstream = fs.createReadStream(path);
        var bf = new BufferHelp();
        readstream.on('data', function (chunk) {
            bf.concat(chunk);
        });
        readstream.on('end', function () {
            resolve(decodeBuffer(bf))
        });
    })
}

function writeFile(path, str) {
    return new Promise(function (resolve, reject) {
        var writestream = fs.createWriteStream(path);
        writestream.write(str);
        writestream.on('close', function () {
            resolve();
        });
    })
}
function decodeBuffer(bf, encoding) {
    var val = iconv.decode(bf.toBuffer(), encoding || 'utf8');
    if (val.indexOf('�') != -1) {
        val = iconv.decode(bf.toBuffer(), 'gbk');
    }
    return val;
}


function getNewToken(config, cb) {
    return new Promise(function (resolve, reject) {
        var tokenUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appId=' + config.appId + '&secret=' + config.appSecret;

        request.get(tokenUrl, function (error, response, body) {
            if (error) {
                reject(error);
            }
            else {
                try {
                    var token = JSON.parse(body).access_token;
                    resolve(token);
                }
                catch (e) {
                    reject(e);
                }
            }
        });
    })
}


function getToken(){
  return  new Promise(function(resolve,reject){
    readFile(tokenPath).then(function(result){      
        if((JSON.parse(result||"{}").time||0)+7000000<(+new Date())){
            getNewToken(config).then(function(data){
                let obj = {}
                obj.token = data;
                obj.time = new Date().getTime();
                // 文件保存
                writeFile(tokenPath, JSON.stringify(obj));
                resolve(data)
            })
        }else{
            resolve(JSON.parse(result||"").token)
        }
    })
  })
}

// getToken().then((data)=>{
//     console.log(data)
// })

function getNewTicket(config) {
    return new Promise((resolve, reject) => {
        getToken(config).then((token) => {
            request.get('https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + token + '&type=jsapi', function (error, res, body) {
                if (error) {
                    reject(error);
                }
                else {
                    try {
                        var ticket = JSON.parse(body).ticket;
                        let obj = {}
                        obj.ticket = ticket;
                        obj.time = new Date().getTime();
                        // 文件保存
                        writeFile(ticketPath, JSON.stringify(obj));
                        resolve(ticket);
                    }
                    catch (e) {
                        reject(e);
                    }
                }
            });
        })
    })
}

async function  getTicket(){
    let obj = await readFile(ticketPath)
    let ticket;
    if ((JSON.parse(obj || "{}").time || 0) + 7000000 < (+new Date())) {
        console.log("过期了")
         ticket = await getNewTicket(config);
    }else{
        console.log("未过期")
        ticket = JSON.parse(obj||"{}").ticket;
    }
    // return Promise.resolve(ticket);
    return ticket
}
getTicket().then((data)=>{console.log(data)})


