/* eslint-env node */

var fs = require('fs');
var path = require('path');

var readdir = promisify(fs.readdir);
var stat = promisify(fs.stat);
var copyFile = promisify(fs.copyFile);
var writeFile = promisify(fs.writeFile);
var mkdir = promisify(fs.mkdir);

exports.promisify = promisify;
exports.recursiveReaddir = recursiveReaddir;
exports.read = promisify(fs.readFile);
exports.copy = copy;
exports.output = output;
exports.rebasePath = rebasePath;
exports.mkdirP = mkdirP;
exports.concat = concat;

function concat(files) {
  return Promise.all(
    files.map(function(filename) {
      return exports.read(filename);
    })
  ).then(function(filesContents) {
    return Buffer.concat(filesContents).toString();
  });
}

function promisify(originalFn) {
  return function() {
    var scope = this;
    var args = Array.prototype.slice.call(arguments, 0);
    return new Promise(function(resolve, reject) {
      try {
        originalFn.apply(
          scope,
          [].concat(args, function(err) {
            if (err) {
              reject(arguments[0]);
            } else if (arguments.length == 2) {
              resolve(arguments[1]);
            } else {
              resolve(args.slice(1));
            }
          })
        );
      } catch (e) {
        reject(e);
      }
    });
  };
}

function copy(from, to) {
  return mkdirP(path.dirname(to)).then(function() {
    return copyFile(from, to);
  });
}

function output(filePath, content) {
  return mkdirP(path.dirname(filePath)).then(function() {
    return writeFile(filePath, content);
  });
}

function mkdirP(dirpath) {
  var np = path.normalize(path.relative(process.cwd(), dirpath));
  var bits = np.split(path.sep);

  return bits.reduce(function(promise, bit, i) {
    return promise.then(function() {
      var nextPath = path.join.apply(path, bits.slice(0, i + 1));
      return mkdir(nextPath).catch(function(e) {
        if (e.code !== 'EEXIST') {
          throw e;
        }
      });
    });
  }, Promise.resolve());
}

function recursiveReaddir(filePath, extension) {
  return readdir(filePath)
    .then(function(files) {
      return Promise.all(
        files.map(function(file) {
          return stat(filePath + '/' + file);
        })
      ).then(function(stats) {
        return Promise.all(
          stats.map(function(stat, i) {
            if (stat.isDirectory()) {
              return recursiveReaddir(filePath + '/' + files[i]);
            } else {
              return Promise.resolve(filePath + '/' + files[i]);
            }
          })
        );
      });
    })
    .then(function(results) {
      var allFiles = [].concat.apply([], results).map(path.normalize);
      if (extension) {
        return allFiles.filter(function(s) {
          var extname = path.extname(s);
          return (
            extname.indexOf(extension) === extname.length - extension.length
          );
        });
      }
      return allFiles;
    });
}

function rebasePath(src, dest, extname) {
  extname = extname || path.extname(src);
  var splicedSrcDirname = path.dirname(
    path
      .normalize(src)
      .split(path.sep)
      .slice(1)
      .join(path.sep)
  );
  var srcBasename = path.basename(src).replace(/\.[^.]+$/, '');

  return path.join(dest, splicedSrcDirname, srcBasename) + extname;
}
