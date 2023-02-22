const crypto = require('node:crypto');
const { secretKey } = require('./config.js');


// X = 30 secs, cv to unix (30 * 1000)
// T0 = unix time, default to 0
// T = curr unix time - T0 / X

const globals = {
  digits: 6,
  step: 30, // step = X
};

function counterFormula(time, t0, x) {
  return Math.floor((time-t0)/x);
}

function counter2buff(cntr) {
  let copycntr = cntr.toString(16);

  while(copycntr.length < 16) {
    copycntr = '0' + copycntr;
  }

  return Buffer.from(copycntr, 'hex');
}

function dynamicTrunc(buff) {
  const offset = buff[19] & 0xf;
  const bincode = (
    (buff[offset] & 0x7f) << 24 |
    (buff[offset+1] & 0xff) << 16 |
    (buff[offset+2] & 0xff) << 8 |
    (buff[offset+3] & 0xff)
  );

  let tok = bincode % Math.pow(10, globals.digits);
  while(tok.length < globals.digits) {
    tok = '0' + tok.toString();
  }

  return tok.toString();
}

function totp(key, dur) {
  const hmac = (buf) => crypto.createHmac('sha1', Buffer.from(key, 'utf8')).update(buf).digest();
  const counter = counterFormula(dur || Math.floor(Date.now()/1000), 0, globals.step);

  const cbuff = counter2buff(counter);
  const sbits = dynamicTrunc(hmac(cbuff));

  return parseInt(sbits);
}

function totp_validate(key, token, dur) {
  const gentok = totp(key, dur);

  return gentok === token;
}

const token = totp(secretKey);
console.log('Token:', token);

const isvalid = totp_validate(secretKey, token);
console.log('Token valid:', isvalid);

console.log('Waiting', globals.step, 'secs');
setTimeout(() => {
  const isvalid = totp_validate(secretKey, token);
  console.log('Token still valid after', globals.step, 'secs?', isvalid ? 'Yes' : 'Nope');
}, globals.step * 1000);
