/* global sjcl */

sjcl.codec.base58Check = {
  defaultChecksumFn: function(bits) {
    return sjcl.bitArray.bitSlice(
      sjcl.hash.sha256.hash(sjcl.hash.sha256.hash(bits)),
      0,
      32
    );
  },

  fromBits: function(version, bits, checksumFn) {
    checksumFn = checksumFn || sjcl.codec.base58Check.defaultChecksumFn;

    var bitsWithHeader = sjcl.bitArray.concat(
      [sjcl.bitArray.partial(8, version)],
      bits
    );
    var checksum = checksumFn(bitsWithHeader);
    var headerPayloadAndChecksum = sjcl.bitArray.concat(
      bitsWithHeader,
      checksum
    );
    var base58str = sjcl.codec.base58.fromBits(headerPayloadAndChecksum);

    var leadingZeroBits = 0;
    while (
      sjcl.bitArray.extract(headerPayloadAndChecksum, leadingZeroBits, 8) == 0
    ) {
      base58str = '1' + base58str;
      leadingZeroBits += 8;
    }

    return base58str;
  },
  toBits: function(str, checksumFn) {
    checksumFn = checksumFn || sjcl.codec.base58Check.defaultChecksumFn;

    var bits = sjcl.codec.base58.toBits(str);
    var bitlen = sjcl.bitArray.bitLength(bits);
    //    var headerByte = sjcl.bitArray.extract(bits, 0, 8);
    var payload = sjcl.bitArray.bitSlice(bits, 0, bitlen - 32);

    var transmittedChecksum = sjcl.bitArray.bitSlice(bits, bitlen - 32);
    var computedChecksum = checksumFn(payload);
    if (!sjcl.bitArray.equal(computedChecksum, transmittedChecksum)) {
      throw new Error('Checksums do not match');
    }

    return payload;
  }
};
