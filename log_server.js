const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            console.log(body);
            fs.appendFileSync('migration_logs.txt', body + '\n');
            res.writeHead(200);
            res.end();
        });
    }
});

server.listen(9999, () => {
    console.log('Listening for logs on port 9999');
});
