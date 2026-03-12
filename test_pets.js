const http = require('http');

const data = JSON.stringify({ email: 'admin@petwellness.com', password: 'admin123' });

const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        const response = JSON.parse(body);
        const token = response.data.token;

        const tokenOptions = {
            hostname: 'localhost',
            port: 8080,
            path: '/api/admin/pets',
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        };

        const req2 = http.request(tokenOptions, res2 => {
            let body2 = '';
            res2.on('data', chunk => body2 += chunk);
            res2.on('end', () => console.log(body2));
        });
        req2.end();
    });
});
req.write(data);
req.end();
