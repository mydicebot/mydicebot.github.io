#!/usr/bin/env node

/* eslint-env node */

exports.run = build;

var config = require('./config');
var file = require('./lib/file');

if (require.main === module) {
  build().catch(function(error) {
    console.error(error); // eslint-disable-line no-console
    process.exit(1);
  });
}

function build() {
  return file
    .mkdirP('lib')
    .then(function() {
      return file.concat(config.sjclFileList);
    })
    .then(function(contents) {
      return file.read(config.wrapperPath).then(function(wrapper) {
        var wrappedContents = wrapper
          .toString()
          .replace(/\/\/ SJCL_INSERT_POINT/, contents);
        return file.output(config.outFile, wrappedContents);
      });
    });
}
