const http = require('http');
const endpoints = [
  '/api/pro/report/cases/metrics/all',
  '/api/pro/report/user/all/metrics',
  '/api/pro/report/structures/departments',
  '/api/pro/report/cases/organdproduct/organization/summary',
];

const loginOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

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
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

(async () => {
  try {
    const loginBody = { email: 'nejatebrahim35@gmail.com', password: 'Admin@123' };
    const loginRes = await httpRequest(loginOptions, loginBody);
    console.log('LOGIN STATUS', loginRes.status);
    console.log('LOGIN BODY', JSON.stringify(loginRes.body, null, 2));
    if (loginRes.status !== 200 || !loginRes.body.accessToken) {
      console.error('Login failed; cannot query protected endpoints.');
      process.exit(1);
    }
    const token = loginRes.body.accessToken;

    for (const endpoint of endpoints) {
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: endpoint,
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      const res = await httpRequest(options);
      console.log('ENDPOINT', endpoint);
      console.log('STATUS', res.status);
      console.log('BODY', JSON.stringify(res.body, null, 2));
      console.log('---');
    }
  } catch (error) {
    console.error('ERROR', error);
    process.exit(1);
  }
})();
