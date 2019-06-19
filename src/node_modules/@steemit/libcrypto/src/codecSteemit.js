/* global sjcl */
sjcl.codec.steemit = {
  ROLES: ['owner', 'memo', 'active', 'posting'],
  MAINNET: {
    pubHeader: 0x0,
    privHeader: 0x80,
    pubPrefix: 'STM'
  },
  TESTNET: {
    pubHeader: 0x0,
    privHeader: 0x80,
    pubPrefix: 'TST'
  },
  keyChecksum: function(bits) {
    return sjcl.bitArray.bitSlice(sjcl.hash.ripemd160.hash(bits), 0, 32);
  },

  keysFromPassword: function(account, password) {
    var keyPairs = {};
    var CURVE = sjcl.ecc.curves.k256;
    for (var i = 0; i < sjcl.codec.steemit.ROLES.length; i++) {
      var role = sjcl.codec.steemit.ROLES[i];
      var seed = account + role + password;
      var secret = sjcl.bn.fromBits(
        sjcl.hash.sha256.hash(sjcl.codec.utf8String.toBits(seed))
      );
      keyPairs[role] = sjcl.ecc.ecdsa.generateKeys(CURVE, 0, secret);
    }
    return keyPairs;
  },

  signRecoverably: function(sec, hash, paranoia, fixedKForTesting) {
    /*
     * an explanation of the format of the recovery parameter.
     * given any ECDSA signature (r, s), there are 4 possible public keys that could have
     * generated the signature over the hash. Two have odd Y-coordinates and two have
     * even Y-coordinates. the recovery parameter deterministically identifies the public key
     * that _did_ generate the signature.
     *
     * to get the public key given the recovery parameter, do the following:
     * a. if the recovery parameter is between 27 and 31, subtract 27 and remember that the public
     * key that produced the signature is canonically an "uncompressed" public key (i.e. known by
     * its X and Y coordinates)
     * b. If the recovery parameter is between 31 and 34, subtract 31 and remember that the public
     * key that produced the signature is canonically a "compressed" public key (i.e. known by only
     * its X coordinate).
     *
     * note that in the Steem blockchain, all public keys are canonically compressed and therefore the
     * recovery parameter will always be between 31 and 34. therefore only case "b" applies here.
     *
     * after the subtraction, you will get a number between 0 and 4. this number, i, encodes the parity
     * and "overflow" of the candidate public key among the four options.
     *
     * the lowest bit of i in binary notation indicates the parity of the candidate public key.
     * if the lowest bit is set, the candidate public key's Y coordinate is odd. If it is cleared, the
     * Y coordinate is even.
     *
     * The next-lowest bit of i, if set, indicates that the candidate public key's x was greater than
     * the order of k. This is true of approximately 1 in 1^127 points on the secp256k1 curve.
     * considering the rarity of this condition, it's much much simpler to just brute-force this
     * condition when it occurs, following §4.1.6.
     */

    if (sjcl.bitArray.bitLength(hash) > this._curveBitLength) {
      hash = sjcl.bitArray.clamp(hash, this._curveBitLength);
    }

    while (true) {

      var CURVE = sjcl.ecc.curves.k256,
        n = CURVE.r,
        l = n.bitLength(),
        k = fixedKForTesting || sjcl.bn.random(n.sub(1), paranoia).add(1),
        R = CURVE.G.mult(k);

      if (fixedKForTesting) {
        fixedKForTesting = fixedKForTesting.add(1);
      }
      
      if (R.isIdentity) {
        continue;
      }

      var r = R.x.mod(n),
        ss = sjcl.bn.fromBits(hash).add(r.mul(sec._exponent)),
        s = ss.mul(k.inverseMod(n)).mod(n),
        isOdd = R.y.limbs[0] & (0x1 == 1),
        recoveryParam = 31;

        if (isOdd) {
          recoveryParam++;
        }
   
        var rBitArray = r.toBits(l);
        var sBitArray = s.toBits(l);

        var r0 = sjcl.bitArray.extract(rBitArray, 0, 8);
        var r1 = sjcl.bitArray.extract(rBitArray, 8, 8);
        var s0 = sjcl.bitArray.extract(sBitArray, 0, 8);
        var s1 = sjcl.bitArray.extract(sBitArray, 8, 8);
            
        if (!(r0 & 0x80)
          && !(r0 == 0 && !(r1 & 0x80))
          && !(s0 & 0x80)
          && !(s0 == 0 && !(s1 & 0x80))) {
          var rawSig = sjcl.bitArray.concat(r.toBits(l), s.toBits(l));
      
          return sjcl.bitArray.concat(
            [sjcl.bitArray.partial(8, recoveryParam)],
            rawSig
          );
        }
     }
  },

  recoverPublicKey: function(hash, sig) {
    var CURVE = sjcl.ecc.curves.k256;
    var n = CURVE.r;
    var G = CURVE.G;

    var recoveryParameter = sjcl.bitArray.extract(sig, 0, 8) - 31;
    var e = sjcl.bn.fromBits(hash);
    var r = sjcl.bn.fromBits(sjcl.bitArray.bitSlice(sig, 8, 264));
    var s = sjcl.bn.fromBits(sjcl.bitArray.bitSlice(sig, 264));

    if (recoveryParameter < 0 || recoveryParameter > 4) {
      throw new Error('Corrupt signature: recovery parameter is wrong');
    }

    var hasOddParity = (recoveryParameter & 0x1) === 1;

    for (var j = 0; j <= 1; j++) {
      var x = r.add(n.mul(j));

      var y = sjcl.codec.steemit._yFromX(x, hasOddParity);
      var p = new sjcl.ecc.point(CURVE, x, y);

      var rInv = r.inverseMod(n);
      var eNeg = new sjcl.bn(0).sub(e).mod(n);
      var keyPoint = G.mult2(eNeg, s, p).mult(rInv);
      var key = new sjcl.ecc.ecdsa.publicKey(CURVE, keyPoint);
      try {
        key.verify(hash, sjcl.bitArray.bitSlice(sig, 8));
        return key;
      } catch (_) {
        // do nothing, wait for next j
      }
    }
    throw new Error('public key was unrecoverable');
  },

  serializePublicKey: function(key, net) {
    net = net || sjcl.codec.steemit.MAINNET;

    var point = key.get();
    var header = net.pubHeader;

    // the public key header sets 0x3 if X is odd, 0x2 if even
    if (sjcl.bn.fromBits(point.y).limbs[0] & 0x1) {
      header |= 0x3;
    } else {
      header |= 0x2;
    }
    return (
      net.pubPrefix +
      sjcl.codec.base58Check.fromBits(
        header,
        point.x,
        sjcl.codec.steemit.keyChecksum
      )
    );
  },

  deserializePublicKey: function(pubKey, net) {
    net = net || sjcl.codec.steemit.MAINNET;
    var CURVE = sjcl.ecc.curves.k256;

    if (pubKey.indexOf(net.pubPrefix) !== 0) {
      throw new Error(
        'Public key is not in correct format, it should begin with "' +
          net.pubPrefix +
          '"'
      );
    }

    var payload = sjcl.codec.base58Check.toBits(
      pubKey.slice(3),
      sjcl.codec.steemit.keyChecksum
    );
    var headerByte = sjcl.bitArray.extract(payload, 0, 8);
    var isOdd = headerByte == 0x3;
    if ((headerByte & net.pubHeader) !== net.pubHeader) {
      throw new Error('public key has invalid header');
    } else if ((headerByte & 0x3) === 0 && (headerByte & 0x2) === 0) {
      throw new Error(
        'public key has invalid header: should set 0x2 or 0x3, but got 0x' +
          headerByte.toString(16)
      );
    }

    var xBits = sjcl.bitArray.bitSlice(payload, 8);
    var x = sjcl.bn.fromBits(xBits);
    var y = sjcl.codec.steemit._yFromX(x, isOdd);

    return new sjcl.ecc.ecdsa.publicKey(CURVE, new sjcl.ecc.point(CURVE, x, y));
  },

  serializePrivateKey: function(key, net) {
    net = net || sjcl.codec.steemit.MAINNET;
    return sjcl.codec.base58Check.fromBits(net.privHeader, key.get());
  },

  deserializePrivateKey: function(wif, header) {
    header = header || sjcl.codec.steemit.MAINNET.privHeader;
    var curve = sjcl.ecc.curves.k256;
    var payload = sjcl.codec.base58Check.toBits(wif);
    var headerByte = sjcl.bitArray.extract(payload, 0, 8);
    if (headerByte !== header) {
      throw new Error(
        'private key has invalid header: wanted 0x' +
          header.toString(16) +
          ', got 0x' +
          headerByte.toString(16)
      );
    }

    var keyBits = sjcl.bitArray.bitSlice(payload, 8);
    return new sjcl.ecc.ecdsa.secretKey(curve, sjcl.bn.fromBits(keyBits));
  },

  _yFromX: function(x, shouldBeOdd) {
    var CURVE = sjcl.ecc.curves.k256;
    var PIDENT = sjcl.codec.steemit._getPident();

    var alpha = x
      .powermod(3, CURVE.field.modulus)
      .add(x.mulmod(CURVE.a, CURVE.field.modulus))
      .add(CURVE.b)
      .mod(CURVE.field.modulus);

    var y = alpha.powermod(PIDENT, CURVE.field.modulus);
    var yIsOdd = y.mod(2).equals(1);

    if ((yIsOdd && shouldBeOdd) || (!yIsOdd && !shouldBeOdd)) {
      return y;
    } else {
      return CURVE.field.modulus.sub(y).normalize();
    }
  },

  _getPident: function() {
    if (!sjcl.codec.steemit.PIDENT) {
      sjcl.codec.steemit.PIDENT = sjcl.ecc.curves.k256.field.modulus
        .add(1)
        .normalize()
        .halveM()
        .halveM()
        .normalize();
    }
    return sjcl.codec.steemit.PIDENT;
  }
};
