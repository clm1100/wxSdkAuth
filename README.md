# wxSdkAuth
微信接口开发、SDK开发、Auth开发

在i5ting的库的基础上增加了获取基础access_token的接口,和js-SDKticket的接口.
读取文件用流的形式速度更快,不吃内存
```

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
```
