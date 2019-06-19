exports.wrapperPath = 'src/crypto.js';
exports.sjclPrefix = 'vendor/sjcl/';
exports.outFile = 'lib/crypto.js';

// the files we actually use to build sjcl
exports.sjclFileList = [
  exports.sjclPrefix + 'sjcl.js',
  exports.sjclPrefix + 'core/bitArray.js',
  exports.sjclPrefix + 'core/aes.js',
  exports.sjclPrefix + 'core/bn.js',
  exports.sjclPrefix + 'core/codecArrayBuffer.js',
  exports.sjclPrefix + 'core/codecString.js',
  exports.sjclPrefix + 'core/ecc.js',
  exports.sjclPrefix + 'core/ripemd160.js',
  exports.sjclPrefix + 'core/sha256.js',
  exports.sjclPrefix + 'core/random.js',

  // our additions
  './src/codecBase58.js',
  './src/codecBase58Check.js',
  './src/codecSteemit.js'
];

// these files are necessary to run the tests, though we don't include them
// in our build of sjcl to reduce size
exports.sjclTestFileList = [
  exports.sjclPrefix + 'core/codecHex.js',
  exports.sjclPrefix + 'core/codecBase64.js',
  exports.sjclPrefix + 'core/ccm.js',
  exports.sjclPrefix + 'core/convenience.js',
  exports.sjclPrefix + 'util.js',
  exports.sjclPrefix + 'test.js',
  // our tests
  './test/sjcl/codecSteemit.vector.test.js',
  './test/sjcl/codecBase58.test.js',
  './test/sjcl/codecBase58Check.test.js',
  './test/sjcl/codecSteemit.test.js'
];
