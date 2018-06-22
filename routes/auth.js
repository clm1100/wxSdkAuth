var express = require('express');
var router = express.Router();
var OAuth = require('wechat-oauth');
var fs = require('fs')
var superagent = require('superagent')
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

// router.get('/code', function (req, res) {
//     let code = req.query.code;  
//     client.getAccessToken(code, function (err, result) {
//         var accessToken = result.data.access_token;
//         var openid = result.data.openid;
//         // res.send(openid)
//         client.getUser(openid, function (err, result) {
//             var userInfo = result;
//             res.json(userInfo)
//           });
//       });
// });

router.get('/redirect',function(req,res){
    var redirect_url  = req.query.url;
    console.log(redirect_url)
    var APPID = "wx75340481908402a8"
    var getCodeUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${APPID}&redirect_uri=${redirect_url}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`;
    res.json({url:getCodeUrl});

    // 这种写法是错误的，ajax返回不能是这种情况
    // res.redirect(getCodeUrl)

})



router.get('/code', function (req, res) {
    let CODE = req.query.code;
    var APPID = "wx75340481908402a8"
    var SECRET = "2b6ee0cbeec0114eb539e68ba356329b"
    var url1 = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${APPID}&secret=${SECRET}&code=${CODE}&grant_type=authorization_code` 
    superagent.get(url1).end(function(err,response){
        console.log(JSON.parse(response.text));
        var ACCESS_TOKEN = JSON.parse(response.text).access_token;
        var OPENID = JSON.parse(response.text).openid;
        var url2 = `https://api.weixin.qq.com/sns/userinfo?access_token=${ACCESS_TOKEN}&openid=${OPENID}&lang=zh_CN`;
        superagent.get(url2).end(function(err,response){
            console.log(response.text)
            res.send(response.text)
        })
    })
});



module.exports = router;
