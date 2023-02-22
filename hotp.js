const crypto = require('node:crypto');
const { secretKey } = require('./config.js');
const assert = require('node:assert');

// const hash = crypto.createHmac('sha1', Buffer.from(secretKey, 'utf8'));

// 0.
const randomCounter = Math.floor(Math.random() * 7) ?? 1;
const length = 6; // could be 6-10, 6-8 is recomended

/**
  * @param {Buffer} buf
  */
function DynamicTruncate(buf) {
  // make sure the 'buf' is 20-bytes
  assert.ok(buf.byteLength === 20);

  const offset = buf[19] & 0xf;
  const bin = (
    ((buf[offset] & 0x7f) << 24) |
    (buf[offset + 1] << 16) |
    (buf[offset + 2] << 8) |
    (buf[offset + 3])
  );

  return bin.toString(2);
}

function createCounter(counter) {
  let copycntr = counter;
  const buf = Buffer.alloc(8);
  for (let i = 7; i >= 0; i--) {
    buf[i] = copycntr && 0xff;
    copycntr >>= 8;
  }

  return buf;
}

// 1.
console.log('Counter:', randomCounter.toString());
const counter = createCounter(randomCounter);
console.log('Counter buff:', counter);
const HS = crypto.createHmac('sha1', Buffer.from(secretKey, 'utf8'))
  .update(counter).digest();

assert.ok(HS.length === 20);

// 2.
const sBits = DynamicTruncate(HS);
const sNum = parseInt(sBits, 2);

// 3.
const hotpValue = sNum % (Math.pow(10, length));
console.log(hotpValue);
