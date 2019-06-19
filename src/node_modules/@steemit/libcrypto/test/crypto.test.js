/* eslint-env node */

var test = require('tape');

var crypto = require('../lib/crypto');

function hex(data) {
  var v = new DataView(data);
  var result = '';
  for (var i = 0; i < v.byteLength; i++) {
    if (v.getUint8(i) < 16) {
      result += '0';
    }
    result += v.getUint8(i).toString(16);
  }
  return result;
}

test('crypto.generateKeys', function(t) {

  var testHash = new Uint8Array(32).buffer; // 32 0s
  var keys = crypto.generateKeys();

  t.equal(keys.public.slice(0, 3), 'STM', 'generated public key is in steem format');

  var sec = crypto.PrivateKey.from(keys.private);
  var pub = crypto.PublicKey.from(keys.public);

  var sig = sec.sign(testHash);

  t.equal(pub.verify(testHash, sig), true, 'public key can verify private key\'s signatures');
  t.equal(pub.verify(testHash, testHash), false, 'public key rejects signatures not originating from private key');

  t.end();

});

test('crypto.keysFromPassword', function(t) {

  var privateKeys = [
    ['owner', '5JCDRqLdyX4W7tscyzyxav8EaqABSVAWLvfi7rdqMKJneqqwQGt'],
    ['memo', '5JSmQQJXH5ZrSW3KJSTUPFJy7SuLeDiY3bW6vB1McamxzJQFhwD'],
    ['active', '5JamTPvZyQsHf8c2pbN92F1gUY3sJkpW3ZJFzdmfbAJPAXT5aw3'],
    ['posting', '5HsoxWiHRRyx6oSxKj32HDqDMzSGhs79zLZopDc7nMcjMbcPp5E']
  ];

  var publicKeys = [
    ['owner', 'STM5pZ15FDVAvNKW3saTJchWmSSmYtEvA6aKiXwDtCq2JRZV9KtR9'],
    ['memo', 'STM5nwJgD9jmkAdTXuiz3jqrkw3om95gCapZo4e4Bcp3qzyiedwCn'],
    ['active', 'STM5SKxjN1YdrFLgoPcp9KteUmNVdgE8DpTPC9sF6jbjVqP9d2Utq'],
    ['posting', 'STM6gZmazY23TEMkxmPpnmvbAgWFAzwtaSDbhSUdmpTXzoJJLPFH4']
  ];

  var keys = crypto.keysFromPassword('username', 'password');

  privateKeys.forEach(function(keyTest) {
    t.equal(keys[keyTest[0]].private, keyTest[1], keyTest[0] + ' private key regenerated correctly');
  });

  publicKeys.forEach(function(keyTest) {
    t.equal(keys[keyTest[0]].public, keyTest[1], keyTest[0] + ' public key regenerated correctly');
  });

  t.end();
});


test('crypto.PrivateKey', function(t) {
  var priv = crypto.PrivateKey.from('5JamTPvZyQsHf8c2pbN92F1gUY3sJkpW3ZJFzdmfbAJPAXT5aw3');
  var pub = priv.getPublicKey();

  t.equal(
    pub.toString(),
    'STM5SKxjN1YdrFLgoPcp9KteUmNVdgE8DpTPC9sF6jbjVqP9d2Utq',
    'regenerates public key correctly'
  );
  
  var emptySha = crypto.sha256(new Uint8Array().buffer);

  var sig = priv.sign(emptySha);
  t.equal(sig.byteLength, 65, 'signatures are 65 bytes long');
  var recoveredKey = crypto.PublicKey.recover(emptySha, sig);
  t.equal(pub.toString(), recoveredKey.toString(), 'recovers public key correctly');
  t.end();
});

test('crypto.PublicKey', function(t) {
  var priv = crypto.PrivateKey.from('5JamTPvZyQsHf8c2pbN92F1gUY3sJkpW3ZJFzdmfbAJPAXT5aw3');
  var pub = crypto.PublicKey.from('STM5SKxjN1YdrFLgoPcp9KteUmNVdgE8DpTPC9sF6jbjVqP9d2Utq');

  var failures = [];
  for (var i = 0; i < 64; i++) {
    var hash = (new Uint8Array(32).fill(i)).buffer;
    var sig = priv.sign(hash);
    if (!pub.verify(hash, sig)) {
      failures.push({
        hash: hash,
        sig: sig
      });
    }
  }

  t.equal(failures.length, 0, 'no failures verifying signatures');
  failures.forEach(function(failure) {
    t.comment('failed hash: ' + hex(hash));
    t.comment('failed sig: ' + hex(sig));
  });
    
  t.end();
});

test('crypto.sha256', function(t) {

  t.equal(
    hex(crypto.sha256(new Uint8Array().buffer)),
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'empty SHA-256'
  );

  t.equal(
    hex(crypto.sha256(new Uint8Array([0x61, 0x62, 0x63]).buffer)),
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    'SHA-256 of string "abc"'
  );

  t.equal(
    hex(crypto.sha256(new Uint8Array(1000000).fill(0x61).buffer)),
    'cdc76e5c9914fb9281a1c7e284d73e67f1809a48a497200e046d39ccc7112cd0',
    'SHA-256 of a million letter "a"s'
  );

  t.end();

});

test('crypto.ripemd160', function(t) {

  t.equal(
    hex(crypto.ripemd160(new Uint8Array().buffer)),
    '9c1185a5c5e9fc54612808977ee8f548b2258d31',
    'empty RIPEMD-160'
  );

  t.equal(
    hex(crypto.ripemd160(new Uint8Array([0x61, 0x62, 0x63]).buffer)),
    '8eb208f7e05d987a9b044a8e98c6b087f15a0bfc',
    'RIPEMD-160 of string "abc"'
  );

  t.equal(
    hex(crypto.ripemd160(new Uint8Array(1000000).fill(0x61).buffer)),
    '52783243c1697bdbe16d37f97f68f08325dc1528',
    'RIPEMD-160 of a million letter "a"s'
  );

  t.end();

});
