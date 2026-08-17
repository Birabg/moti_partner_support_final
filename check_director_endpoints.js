const http = require('http');
const endpoints = [
  '/api/pro/report/cases/metrics/all',
  '/api/pro/report/user/all/metrics',
  '/api/pro/report/structures/departments',
  '/api/pro/report/cases/organdproduct/organization/summary',
  '/api/pro/report/organdproduct/organization/summary'
];

function fetch(path) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method: 'GET',
        headers: { Accept: 'application/json' },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ path, status: res.statusCode, body: JSON.parse(data) });
          } catch (err) {
            resolve({ path, status: res.statusCode, body: data });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

(async () => {
  for (const endpoint of endpoints) {
    try {
      const result = await fetch(endpoint);
      console.log('ENDPOINT', endpoint);
      console.log('STATUS', result.status);
      console.log('BODY', JSON.stringify(result.body, null, 2));
      console.log('---');
    } catch (error) {
      console.error('ERROR', endpoint, error.message);
      console.log('---');
    }
  }
})();
