new sjcl.test.TestCase("base58 codec tests", function (cb) {

  var testValues = [
  { raw: "", coded: ""},
  { raw: " ", coded: "Z"},
  { raw: "-", coded: "n"},
  { raw: "0", coded: "q"},
  { raw: "1", coded: "r"},
  { raw: "-1", coded: "4SU"},
  { raw: "11", coded: "4k8"},
  { raw: "abc", coded: "ZiCa"},
  { raw: "1234598760", coded: "3mJr7AoUXx2Wqd"},
  { raw: "abcdefghijklmnopqrstuvwxyz", coded: "3yxU3u1igY8WkgtjK92fbJQCd4BZiiT1v25f"},
  { raw: "00000000000000000000000000000000000000000000000000000000000000", coded: "3sN2THZeE9Eh9eYrwkvZqNstbHGvrxSAM7gXUXvyFQP8XvQLUqNCS27icwUeDT7ckHm4FUHM2mTVh1vbLmk7y"}
];

  for (var i = 0; i < testValues.length; i++) {
    var testValue = testValues[i];
    var encodedValue = sjcl.codec.base58.fromBits(sjcl.codec.utf8String.toBits(testValue.raw));
    this.require(testValue.coded==encodedValue); 
  } 
  
  cb();
});
