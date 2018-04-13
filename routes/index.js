var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.query);
  res.send(req.query.echostr)
});

router.get('/test',(req,res)=>{
  res.send("666666666666666")
})

var xml2js = require("xml2js");
//创建xml->js的对象
var parser = new xml2js.Parser({ explicitArray: false });
//创建js->xml的对象
var builder = new xml2js.Builder({ rootName: "xml", cdata: true, headless: true });

router.post('/', function(req, res, next) {
  console.log("88888888888888")
  var buffer = [];
  req.on('data',(chunk)=>{
    buffer.push(chunk);
  });
  req.on('end',()=>{
    let str = Buffer.concat(buffer);
    console.log(str.toString());
    parser.parseString(str.toString(), function (err, msgObj) {
      console.log(msgObj)
      var returnMsg = {
        ToUserName: msgObj.xml.FromUserName,
        FromUserName: msgObj.xml.ToUserName,
        CreateTime: +new Date(),
        MsgType: "text",
        Content: "成功了"
    }

    res.send(builder.buildObject(returnMsg));
    })
  })
});

module.exports = router;
