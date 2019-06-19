/* eslint-env node */
var sjcl = require('../lib/crypto').sjcl;

var fakeHash = sjcl.hash.sha256.hash([]);

var fixtures = [];

var keys;

while (fixtures.length < 1) {
  keys = sjcl.ecc.ecdsa.generateKeys(sjcl.ecc.curves.k256);
  if (keys.pub._point.y.mod(2).equals(1)) {
    fixtures.push(generateFixture(keys));
  }
}

while (fixtures.length < 2) {
  keys = sjcl.ecc.ecdsa.generateKeys(sjcl.ecc.curves.k256);
  if (keys.pub._point.y.mod(2).equals(0)) {
    fixtures.push(generateFixture(keys));
  }
}

/* eslint-disable no-console */
console.log(
  'sjcl.test.vector.steemitsig = ' +
    JSON.stringify(fixtures, undefined, 2) +
    ';'
);
/* eslint-enable no-console */

function generateFixture(keys) {
  var fixture = {
    secretKey: sjcl.codec.steemit.serializeSecretKey(keys.sec),
    publicKey: sjcl.codec.steemit.serializePublicKey(keys.pub),
    signatures: []
  };

  for (var i = 0; i < 5; i++) {
    var k = sjcl.bn.random(sjcl.ecc.curves.k256.r.sub(1)).add(1);
    var sig = keys.sec.sign(fakeHash, 0, false, k);
    var r = sjcl.bn.fromBits(sjcl.bitArray.bitSlice(sig, 0, 256));
    var s = sjcl.bn.fromBits(sjcl.bitArray.bitSlice(sig, 256));

    fixture.signatures.push({
      k: k.toString(),
      r: r.toString(),
      s: s.toString()
    });
  }

  return fixture;
}
