const fs = require('fs');
const https = require('https');
const path = require('path');

const dir = path.join(__dirname, 'public');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const urls = {
    'bhim.svg': 'https://upload.wikimedia.org/wikipedia/commons/e/e1/BHIM_Logo.svg',
    'paytm.svg': 'https://static.cdnlogo.com/logos/p/6/paytm.svg',
    'gpay.png': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Google_Pay_Logo_%282020%29.svg/512px-Google_Pay_Logo_%282020%29.svg.png'
};

Object.entries(urls).forEach(([name, url]) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        const file = fs.createWriteStream(path.join(dir, name));
        res.pipe(file);
        file.on('finish', () => console.log(`Successfully Downloaded ${name}`));
    }).on('error', console.error);
});
