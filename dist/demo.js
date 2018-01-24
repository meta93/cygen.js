var lib  = require("./cygen.min.js");
var cygen = new lib.Cygen();
var ng = cygen.generate_random_query_graph({
    order: 10000,
    size: 0,
    connected: false,
    multiGraph: false,
    pseudoGraph: false
  });

console.dir(ng);
var cypher_query = cygen.generate_query(ng);
cygen.show_version();