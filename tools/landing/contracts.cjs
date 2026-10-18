'use strict';
const assert = require('node:assert/strict');
const { changes } = require('./reviewed.json');
const count = (html, value) => html.split(value).length - 1;
function assertCandidate(html) {
  for (const change of changes) assert.equal(count(html, change.after), 1, 'one exact reviewed addition: ' + change.after);
}
function normalize(html) {
  for (const { before, after } of changes) {
    assert.ok(count(html, after) <= 1, 'duplicate reviewed addition');
    html = html.replace(after, before);
    assert.equal(count(html, before), 1, 'exact original region retained');
  }
  return html;
}
module.exports = { assertCandidate, normalize };
