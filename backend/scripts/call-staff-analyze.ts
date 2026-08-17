import 'dotenv/config';
import { JwtUtils } from '../src/utils/jwt';

async function main(){
  const token = JwtUtils.generateAccessToken({
    userId: '77859ee0-b5c8-47c1-9798-5de11d6e969f',
        email: 'selomonyehualashet@gmail.com',
    partyType: 'STAFF',
    firstName: 'Solomon',
    isPSsupport: true
  } as any);

  console.log('Using token (first 20 chars):', token.slice(0,20)+'...');

  try{
    const res = await fetch('http://localhost:5000/api/staff/analyze', {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + token }
    });

    console.log('status', res.status);
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
  }catch(e:any){
    console.error('error', e.message || e);
  }
}

main().catch(e=>{ console.error(e); process.exit(1); });