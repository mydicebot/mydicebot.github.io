#!/usr/bin/env node
/* eslint-env node */

var vm = require('vm');
var file = require('./lib/file');
var config = require('./config');
exports.run = runSjclTests;

if (require.main === module) {
  runSjclTests().catch(function(error) {
    console.error(error); // eslint-disable-line no-console
    process.exit(1);
  });
}

function runSjclTests() {
  return file
    .recursiveReaddir(config.sjclPrefix + '/test', '.js')
    .then(function(allOtherTestFilesList) {
      return [].concat(
        config.sjclFileList,
        config.sjclTestFileList,
        allOtherTestFilesList
      );
    })
    .then(function(testFiles) {
      return Promise.all(
        testFiles.map(function(filename) {
          return file.read(filename).then(function(contents) {
            return new vm.Script(contents.toString(), {
              filename: filename,
              displayErrors: true
            });
          });
        })
      );
    })
    .then(function(scripts) {
      scripts.forEach(function(script) {
        script.runInThisContext();
      });
      return new Promise(function(resolve, reject) {
        /* global sjcl, browserUtil */
        sjcl.test.run(undefined, function() {
          if (browserUtil.allPassed === false) {
            reject(new Error('SJCL tests failed, see logs'));
          } else {
            resolve();
          }
        });
      });
    });
}
