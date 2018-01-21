/*! Cygen.js - v1.1.0 - 2018-01-21
* https://github.com/iongrahpix/Cygen.js
* Copyright (c) 2018 Damoah Dominic; Licensed  */
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

        const version = "1.1.0";
        const INCOMING = "incoming";
        const OUTGOING = "outgoing";
        const NORMAL = "normal";
        const SINGLE = "single";
        const DEV_COLOR = "#000000";
        const PROD_COLOR = "#68BDF6";
        const EASTER_COLOR = "#FF756E";
        const NODE_FILL = DEV_COLOR;

        var instance = null;
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

        this.show_version = function(){
            return "Version: "+version;
        };
        
        this.generate_query = function(input_graph){
            if(input_graph.nodes.length == 0) {
                console.err("No Nodes in your Query");
                return;
            }
            // ** Starting Point ** //
            TGRAPH = input_graph;
            fragments = []; // Empty the fragments array
            //worker_function(TGRAPH); // Recursion
            if(fragments.length > 0){
                var cq = combine_fragments(fragments);
                console.log("New Query: "+cq);
                return cq; // generated query for the Neo4j Database
            }
            console.err("Internal Fragments returned empty");
            return; //
        };

        this.find_isolated_nodes  = function(tgraph){
            
        };

        this.generate_random_query_graph = function(options){
            
        }

        this.is_graph_flagged = function(options){
            
        }

        this.generate_node_frags = function(){

        };

        this.generate_chains = function(){};

        this.generate_cypher = function(){};

        this.generate_fragment = function(){};

        this.generate_single = function(){};

        this.generate_double = function(){};

        this.prune_tgraph = function(){};

        this.search_tgraph = function(){};

        this.prune_links = function(){};

        this.combine_fragments  = function(){};

        this.get_related_links = function(){};

        this.worker_function = function(){};

        this.pick_random = function(){};

        this.calculate_candidate = function(){};

        this.reverse_link = function(){};

        this.get_chance = function(){};

        

    }
    return Cygen;
}));
