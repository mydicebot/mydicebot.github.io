/* global sjcl */
sjcl.codec.base58 = {
  alpha: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
  lookup: {
    '1': 0,
    '2': 1,
    '3': 2,
    '4': 3,
    '5': 4,
    '6': 5,
    '7': 6,
    '8': 7,
    '9': 8,
    A: 9,
    B: 10,
    C: 11,
    D: 12,
    E: 13,
    F: 14,
    G: 15,
    H: 16,
    J: 17,
    K: 18,
    L: 19,
    M: 20,
    N: 21,
    P: 22,
    Q: 23,
    R: 24,
    S: 25,
    T: 26,
    U: 27,
    V: 28,
    W: 29,
    X: 30,
    Y: 31,
    Z: 32,
    a: 33,
    b: 34,
    c: 35,
    d: 36,
    e: 37,
    f: 38,
    g: 39,
    h: 40,
    i: 41,
    j: 42,
    k: 43,
    m: 44,
    n: 45,
    o: 46,
    p: 47,
    q: 48,
    r: 49,
    s: 50,
    t: 51,
    u: 52,
    v: 53,
    w: 54,
    x: 55,
    y: 56,
    z: 57
  },

  toBits: function(fromDigits) {
    var work = new sjcl.bn();
    var fb = new sjcl.bn(58);

    for (var i = 0; i < fromDigits.length; i++) {
      var digit = new sjcl.bn(sjcl.codec.base58.lookup[fromDigits[i]]);
      work.addM(digit.mul(fb.power(fromDigits.length - i - 1)));
    }

    work.fullReduce();
    return work.toBits();
  },

  fromBits: function(bits) {
    var num = sjcl.bn.fromBits(bits);
    var bitlen = sjcl.bitArray.bitLength(bits);
    var len = Math.ceil(bitlen * (Math.log(2) / Math.log(58)));
    var base = new sjcl.bn(58);
    var str = '';

    for (var i = len - 1; i >= 0; i--) {
      var iBig = new sjcl.bn(i);
      var exp = base.power(iBig);

      var pos = 0;
      while (num.greaterEquals(exp)) {
        num.subM(exp);
        num.normalize();
        pos++;
      }
      if (!(i === len - 1 && pos === 0)) {
        str += sjcl.codec.base58.alpha[pos];
      }
    }
    return str;
  }
};
