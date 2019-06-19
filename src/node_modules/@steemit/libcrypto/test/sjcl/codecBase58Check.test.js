new sjcl.test.TestCase("base58Check codec tests", function (cb) {
 
  var testValues = [
    { header: 20, raw: "", coded: "3MNQE1X"},
    { header: 20, raw: " ", coded: "B2Kr6dBE"},
    { header: 20, raw: "-", coded: "B3jv1Aft"},
    { header: 20, raw: "0", coded: "B482yuaX"},
    { header: 20, raw: "1", coded: "B4CmeGAC"},
    { header: 20, raw: "-1", coded: "mM7eUf6kB"},
    { header: 20, raw: "11", coded: "mP7BMTDVH"},
    { header: 20, raw: "abc", coded: "4QiVtDjUdeq"},
    { header: 20, raw: "1234598760", coded: "ZmNb8uQn5zvnUohNCEPP"},
    { header: 20, raw: "abcdefghijklmnopqrstuvwxyz", coded: "K2RYDcKfupxwXdWhSAxQPCeiULntKm63UXyx5MvEH2"},
    { header: 20, raw: "00000000000000000000000000000000000000000000000000000000000000", coded: "bi1EWXwJay2udZVxLJozuTb8Meg4W9c6xnmJaRDjg6pri5MBAxb9XwrpQXbtnqEoRV5U2pixnFfwyXC8tRAVC8XxnjK"}
];

  for (var i = 0; i < testValues.length; i++) {
    var testValue = testValues[i];
    var encodedValue = sjcl.codec.base58Check.fromBits(testValue.header, sjcl.codec.utf8String.toBits(testValue.raw));
    this.require(encodedValue==testValue.coded, "computed '" + encodedValue + "', provided: '" + testValue.coded  + "'");
  } 
  
  cb();
});
