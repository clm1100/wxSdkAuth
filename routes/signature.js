var express = require('express');
var router = express.Router();
var signature = require('wx_jsapi_sign');
var config = require('../config')();
/* GET users listing. */

// 测试更改2
router.post('/getsignature', function(req, res){
    console.log(req.url)
  var url = req.body.url;
  console.log(url);
  signature.getSignature(config)(url, function(error, result) {
        if (error) {
            res.json({
                'error': error
            });
        } else {
            res.json(result);
        }
    });
});


module.exports = router;
