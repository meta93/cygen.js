/**
 * Cygen.js
 *
 *    Mocha Library Test
 */

'use strict'
var assert = require('assert'),
lib = require('../lib/cygen.js');

describe('Cygen.js Basic Tests', function() {
  it('should be able to say hello!', function() {
    var cygen = new lib.Cygen();
    var answer = cygen.say_hello();
    assert.equal(answer,'Hello');
  })

})
