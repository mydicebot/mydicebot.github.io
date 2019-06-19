
libcrypto
=========

A small vendoring wrapper for [sjcl](http://bitwiseshiftleft.github.io/sjcl/) with support for
hashes and encodings required by the Steem platform.

## Usage

If you are using Webpack or Browserify, you must ensure that Node's built-in `crypto` package
is excluded from your builds. 

Otherwise, just
```sh
$ yarn install steem-crypto
```

## API

```
> crypto = require('@steemit/libcrypto');
```

### crypto.sha256(data)

Hashes the content of an `ArrayBuffer` using SHA-256.

```
> shaHash = crypto.sha256(new Uint8Array().buffer)
ArrayBuffer { byteLength: 32 }
> crypto.hexify(shaHash)
'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
```

### crypto.ripemd160(data) 

Hashes the content of an `ArrayBuffer` using RIPEMD-160.

```
> ripemdHash = crypto.ripemd160(new Uint8Array().buffer)
ArrayBuffer { byteLength: 20 }
> crypto.hexify(ripemdHash)
'9c1185a5c5e9fc54612808977ee8f548b2258d31'
```

### crypto.PrivateKey

Provides operations over Steemit secp256k1-based ECC private keys.
```
> secretKey = crypto.PrivateKey.from('5JCDRqLdyX4W7tscyzyxav8EaqABSVAWLvfi7rdqMKJneqqwQGt')
PrivateKey { getPublicKey: [Function], sign: [Function] }
> secretKey.getPublicKey().toString()
'STM5pZ15FDVAvNKW3saTJchWmSSmYtEvA6aKiXwDtCq2JRZV9KtR9'
> secretSig = secretKey.sign(new Uint8Array(32).buffer)
ArrayBuffer { byteLength: 65 }
> crypto.hexify(secretSig)
'20387d5f9ae215a64065fde2a9d4f7be83d3480b7cc89f7c01488042da348845408909e9d4f1d66466c53f0007c771a73bf2883d8d5ab4735b5b4316091361442c'
```

### crypto.PublicKey

Provides operations over Steemit secp256k1-based ECC public keys.
```
> publicKey = crypto.PublicKey.from('STM5SKxjN1YdrFLgoPcp9KteUmNVdgE8DpTPC9sF6jbjVqP9d2Utq')
... 
> publicKey.verify(new Uint8Array(32).buffer, secretSig)
true
> PublicKey.recover(someHash, someSig)
...
```

### crypto.generateKeys()

Generates a new pair of keys in Steem WIF format using cryptographically secure
random number generation.
```
> crypto.generateKeys()
{
  private: "5JCDRqLdyX4W7tscyzyxav8EaqABSVAWLvfi7rdqMKJneqqwQGt",
  public: "STM5pZ15FDVAvNKW3saTJchWmSSmYtEvA6aKiXwDtCq2JRZV9KtR9"
}
```

### crypto.keysFromPassword(accountName, accountPassword)

Given a Steemit account name and password, regenerates the derived `owner`, `posting`,
`active`, and `memo` keys.
```
> crypto.keysFromPassword('username', 'password')
{ owner:
   { private: '5JCDRqLdyX4W7tscyzyxav8EaqABSVAWLvfi7rdqMKJneqqwQGt',
     public: 'STM5pZ15FDVAvNKW3saTJchWmSSmYtEvA6aKiXwDtCq2JRZV9KtR9' },
  memo:
   { private: '5JSmQQJXH5ZrSW3KJSTUPFJy7SuLeDiY3bW6vB1McamxzJQFhwD',
     public: 'STM5nwJgD9jmkAdTXuiz3jqrkw3om95gCapZo4e4Bcp3qzyiedwCn' },
  posting:
   { private: '5HsoxWiHRRyx6oSxKj32HDqDMzSGhs79zLZopDc7nMcjMbcPp5E',
     public: 'STM6gZmazY23TEMkxmPpnmvbAgWFAzwtaSDbhSUdmpTXzoJJLPFH4' },
  active:
   { private: '5JamTPvZyQsHf8c2pbN92F1gUY3sJkpW3ZJFzdmfbAJPAXT5aw3',
     public: 'STM5SKxjN1YdrFLgoPcp9KteUmNVdgE8DpTPC9sF6jbjVqP9d2Utq' } }
```

## Requirements

steem-crypto is written in Javascript as specified by 
[ECMA-262, version 5.1](https://www.ecma-international.org/ecma-262/5.1/).
Other than its vendored copy of sjcl, it has no dependencies and never will.

steem-crypto explicitly supports the following environments without polyfills:
- [Node.js](https://nodejs.com) versions 4 and up
- Microsoft Edge (all versions)
- Safari for macOS versions 7.1+
- Safari for iOS versions 8+
- Firefox, Chrome, and Opera versions 30+

steem-crypto explicitly does not support the following environments:
- Opera Mini
- Android Browser (i.e., the non-Chromium versions)
- Microsoft Internet Explorer versions <10

## Contributing

Contributions must conform to the following rules:
- They must pass formatting and linting and the existing automated test suite must pass.
- They must add test coverage for new code.
- They must not introduce any new dependencies.
- They must support the environments listed above without the use of polyfills.
