
const http = require('http');

const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/health',
    method: 'GET',
    timeout: 2000 // 2s timeout
};

console.log('Testing connection to ' + options.hostname + ':' + options.port + options.path);

const req = http.request(options, (res) => {
    console.log('STATUS: ' + res.statusCode);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log('BODY: ' + chunk);
    });
});

req.on('error', (e) => {
    console.error('PROBLEM: ' + e.message);
});

req.on('timeout', () => {
    console.error('TIMEOUT');
    req.destroy();
});

req.end();
