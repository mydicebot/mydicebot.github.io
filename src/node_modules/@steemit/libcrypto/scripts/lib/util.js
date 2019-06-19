/* eslint-env node */

exports.camelCase = camelCase;
exports.filterObject = filterObject;

function camelCase(str) {
  return str
    .replace(/::\w/g, function(match) {
      return '.' + match[2];
    })
    .replace(/_\w/g, function(match) {
      return match[1].toUpperCase();
    })
    .replace(/\.([\w\d]+)$/, function(match) {
      return '.' + match[1].toUpperCase() + match.slice(2);
    });
}

function filterObject(obj, name) {
  if (Array.isArray(obj)) {
    return obj.map(function(el) {
      return filterObject(el, name);
    });
  } else if (typeof obj === 'object' && obj !== null) {
    var result = {};
    for (var key in obj) {
      if (name === key) {
        continue;
      }
      result[key] = filterObject(obj[key], name);
    }
    return result;
  } else {
    return obj;
  }
}
