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
    var answer = cygen.version();
    
    assert.equal(answer,'Version: 1.1.0');
  })
});

describe('Cygen.js Intermediate Tests', function() {
  it('should * ', function() {
    
  })
});

describe('Cygen.js Advanced Tests', function() {
  it('should *', function() {
    
  })
});
