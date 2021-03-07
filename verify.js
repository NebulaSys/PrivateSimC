const nacl = require('tweetnacl');

// Your public key can be found on your application in the Developer Portal
const PUBLIC_KEY = process.env.PUBLIC_KEY || 'c833e91c733a5cc352a03b3cd29c61a2b1eac12e86cb966b5868c2ae615ced3c';

function Verify(signature, timestamp) {
    // const signature = req.get('X-Signature-Ed25519');
    // const timestamp = req.get('X-Signature-Timestamp');
    const body = req.rawBody;

    const isVerified = nacl.sign.detached.verify(
        Buffer.from(timestamp + body),
        Buffer.from(signature, 'hex'),
        Buffer.from(PUBLIC_KEY, 'hex')
    );
    return isVerified;
}

module.exports = { Verify };