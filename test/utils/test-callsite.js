const createCallsiteRecord = require('callsite-record');

function someFunc() {
  throw new Error('Hey ya!');
}

try {
  someFunc();
} catch (err) {
  module.exports = createCallsiteRecord(err);
}
