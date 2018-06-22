const axios = require('axios');

axios.post('http://www.tuling123.com/openapi/api', {
    "key": "c396dbc1dadd4fd09c61b4a2ae65ba9a",
    "info": "哈哈"
}).then(function (result) {
    console.log(result.data)
})