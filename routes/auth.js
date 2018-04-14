var express = require('express');
var router = express.Router();
var OAuth = require('wechat-oauth');
var fs = require('fs')
// var client = new OAuth('your appid', 'your secret');
var client = new OAuth('wx75340481908402a8', '2b6ee0cbeec0114eb539e68ba356329b', function (openid, callback) {

    fs.readFile(openid + ':access_token.txt', 'utf8', function (err, txt) {
        if (err) { return callback(err); }
        callback(null, JSON.parse(txt));
    });
}, function (openid, token, callback) {

    fs.writeFile(openid + ':access_token.txt', JSON.stringify(token), callback);
});

var url = client.getAuthorizeURL('http://qq.nodejsvue.cn/code', '测试信息', 'snsapi_userinfo');
var FEurl = client.getAuthorizeURL('http://qq.nodejsvue.cn/auth.html', '测试信息', 'snsapi_userinfo');


router.get('/auth', function (req, res) {
    res.redirect(url)
});

router.get('/feauth', function (req, res) {
    res.redirect(FEurl)
});

router.get('/code', function (req, res) {
    let code = req.query.code;  
    client.getAccessToken(code, function (err, result) {
        var accessToken = result.data.access_token;
        var openid = result.data.openid;
        // res.send(openid)
        client.getUser(openid, function (err, result) {
            var userInfo = result;
            res.json(userInfo)
          });
      });
});

module.exports = router;
