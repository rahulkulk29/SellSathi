
var http = require('http');

var options = {
    host: 'localhost',
    port: 5000,
    path: '/admin/stats',
    method: 'GET'
};

var req = http.request(options, function (res) {
    console.log('STATUS: ' + res.statusCode);
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
        console.log('BODY: ' + chunk);
    });
});

req.on('error', function (e) {
    console.log('problem with request: ' + e.message);
});

req.end();
