// Cygen.js Benchmarking tests
var lib  = require("./cygen.min.js");
var Benchmark = require('benchmark');
var suite = new Benchmark.Suite;
var cygen = new lib.Cygen();
var cypher_query = "";

// Generate some random input query graphs
var ng_10 = cygen.generate_random_query_graph({
    order: 10,
    size: 0,
    connected: false,
    multiGraph: false,
    pseudoGraph: false
});
var ng_100 = cygen.generate_random_query_graph({
    order: 100,
    size: 0,
    connected: false,
    multiGraph: false,
    pseudoGraph: false
});
var ng_1k = cygen.generate_random_query_graph({
    order: 1000,
    size: 0,
    connected: false,
    multiGraph: false,
    pseudoGraph: false
});
var ng_10k = cygen.generate_random_query_graph({
    order: 10000,
    size: 0,
    connected: false,
    multiGraph: false,
    pseudoGraph: false
});
var ng_100k = cygen.generate_random_query_graph({
    order: 10000,
    size: 0,
    connected: false,
    multiGraph: false,
    pseudoGraph: false
});
var ng1m = cygen.generate_random_query_graph({
    order: 1000000,
    size: 0,
    connected: false,
    multiGraph: false,
    pseudoGraph: false
});

// Testing with 10 nodes
// Testing with 100 nodes
// Testing with 1000 nodes (1k)
// Testing with 10000 nodes (10k)
// Testing with 100000 nodes (100k)
// Testing with  1000000 nodes (1m)
// Testing with 10000000 nodes (10m)
suite.add('ng_10', function() {
    cygen.generate_query(ng_10);
});
suite.add('ng_100', function() {
    cygen.generate_query(ng_100);
});
suite.add('ng_1k', function() {
    cygen.generate_query(ng_1k);
});
suite.add('ng_10k', function() {
    cygen.generate_query(ng_10k);
});
suite.add('ng_100k', function() {
    cygen.generate_query(ng_100k);
});
suite.add('ng1m', function() {
    cygen.generate_query(ng1m);
});

suite.on('cycle', function(event) {
    console.log("\n"+event.target.name+": \n");
    console.dir(event.target.stats.sample);
});

suite.on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
});

suite.run({ 'async': false });

cygen.show_version();