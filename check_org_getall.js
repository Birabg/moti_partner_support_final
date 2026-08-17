const http = require('http');

function httpRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

(async () => {
  try {
    const loginOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    };

    const loginRes = await httpRequest(loginOptions, { email: 'nejatebrahim35@gmail.com', password: 'Admin@123' });
    console.log('LOGIN', loginRes.status);
    if (loginRes.status !== 200) return console.error('login failed', loginRes.body);
    const token = loginRes.body.accessToken;

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/organization/getAll',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    };

    const res = await httpRequest(options);
    console.log('GET /api/organization/getAll', res.status);
    console.log(JSON.stringify(res.body, null, 2));
  } catch (e) {
    console.error(e);
  }
})();
