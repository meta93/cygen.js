(function (root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals
        root.Cygen = factory();
    }
}(this, function () {
    'use strict';
    function Cygen() {

        const version = "0.5.4";
        const INCOMING = "incoming";
        const OUTGOING = "outgoing";
        const NORMAL = "normal";
        const SINGLE = "single";
        const DEV_COLOR = "#000000";
        const PROD_COLOR = "#68BDF6";
        const EASTER_COLOR = "#FF756E";
        const NODE_FILL = DEV_COLOR;

        var instance = null;
        var GRAPH = null;
        var TGRAPH = null;
        var cypher_text = null;
        var fragments = [];
        var myCodeMirror;
        var conn_gen = true;
        var bidirectional_gen = false;
        var pseudo_gen = false;
        var optimize_query = false;
        var non_directed_mix_full = false;
        var non_directed_mix = false;

        
        this.generate_query = function(input_graph){
            return "I am a query";
        };

        this.find_isolated_nodes  = function(tgraph){
            
        };

        this.generate_random_query_graph = function(options){
            
        }
    }
    return Cygen;
}));
