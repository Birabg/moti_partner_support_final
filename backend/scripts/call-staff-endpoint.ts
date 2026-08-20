import 'dotenv/config';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

async function main(){
  const staffId = 'af63cef8-5e1c-41b4-bc98-7db592deb0d6';
  const secret = process.env.JWT_ACCESS_SECRET || 'your_access_secret_here';
  const token = jwt.sign({ userId: staffId, partyType: 'STAFF', isPSsupport: true, firstName: 'Test', lastName: 'Agent' }, secret, { expiresIn: '15m' });
  console.log('Using token:', token.substring(0,20)+'...');

  try{
    const res = await fetch('http://localhost:5000/api/staff/feedback/analytics', { headers: { Authorization: 'Bearer '+token } });
    const json = await res.json();
    console.log('Status', res.status);
    console.log(JSON.stringify(json, null, 2));
  }catch(e:any){
    console.error(e?.message || e);
  }
}

main();
