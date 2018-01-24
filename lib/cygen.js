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

        this.version = function(){
            return "Version: "+version;
        };

        this.show_version = function(){
            console.info(this.version());
        };

        this.find_isolated_nodes  = function(tgraph){
            var nodes = tgraph.nodes;
            var links = tgraph.links;
            var black_list = [];

            for (var i = 0; i < nodes.length; i++) {
                var found = false;
                for (var j = 0; j < links.length; j++) {
                    if(nodes[i].id == links[j].source.id || nodes[i].id == links[j].target.id){
                        found = true;
                    }
                }
                if(!found)
                {
                    black_list.push(nodes[i]);
                }
            }
            return black_list;
        };

        this.generate_random_query_graph = function(options){
            
            var def_options = {
                order: 10,
                size: 15,
                connected: false,
                multiGraph: false,
                pseudoGraph: false
              };
        
              var i, u, v;
              var nodes = [];
              var adjacencyList = [];
              for (i = 0; i < options.order; i += 1) {
                adjacencyList[i] = [];
                nodes.push({ id: i });
              }
        
              function add(u, v) {
                adjacencyList[u][v] = adjacencyList[v][u] = true;
              }
        
              var edges = [];
              i = 0;
        
              if (options.connected) {
                for (i = 1; i < options.order; i += 1) {
                  v = Math.floor(Math.random() * i);
                  add(i, v);
                  edges.push({
                    source: i,
                    target: v
                  });
                }
                i -= 1;
              }
        
              for (; i < options.size; i += 1) {
                u = Math.floor(Math.random() * options.order);
                v = Math.floor(Math.random() * options.order);
        
                if (u === v && !options.pseudoGraph) {
                  i -= 1;
                } else if (adjacencyList[u][v] && !options.multiGraph) {
                  i -= 1;
                } else {
                  add(u, v);
                  edges.push({
                    source: u,
                    target: v
                  });
                }
              }
        
              return {
                nodes: nodes,
                links: edges
              };
        }

        this.is_graph_flagged = function(g){
            var fcount = 0;
            for (var i = 0; i < g.links.length; i++) {
                if(g.links[i].flagged){
                    fcount++;
                }
            }
            if(fcount == 0){
                return false;
            }
            if(fcount == g.links.length){
                return true;
            }
            else {
                return false;
            }
        }

        this.generate_chains = function(graph){
            var chains = { incoming: [], outgoing: [] };
            if(this.is_graph_flagged(graph) || graph.links.length == 0){
                return chains;
            }
            var ix = graph.nodes.length;
            for(var i = 0; i < ix; i++){
                var in_count = 0;
                var out_count = 0;
                var ident = graph.nodes[i].id;
                for (var j = graph.links.length - 1; j >= 0; j--) {
                    if(!graph.links[j].flagged){
        
                        if(ident == graph.links[j].source.id){
                        out_count++;
                        }
                        else if(ident == graph.links[j].target.id){
                            in_count++;
                        }
                    }
                }
                chains.incoming.push({node: ident, count: in_count});
                chains.outgoing.push({node: ident, count: out_count});
            }
            return chains;
        };

        this.prune_tgraph = function prune_tgraph(indices){
            for (var i = 0; i < indices.length; i++) {
                TGRAPH.links[indices[i]].flagged = true;
            }
        };

        this.generate_fragment = function(mode,candidate){
            var t_indices = [];
            var links_remove = [];
            if(mode == SINGLE){
                for (var i = 0; i < TGRAPH.links.length; i++) {
                    if(!TGRAPH.links[i].flagged){
                        var frg = this.generate_single(TGRAPH.links[i]);
                        t_indices.push(i);
                        fragments.push(frg);
                    }
                }
                this.prune_tgraph(t_indices);
            }
            else if(mode == NORMAL){
                if(candidate.param.chain == INCOMING){
                    var elinks = candidate.param.related_links;
                    if(elinks.length % 2 == 0){
                        for (var i = 0; i < elinks.length; i+=2) {
                            if(!elinks[i].flagged && !elinks[i+1].flagged){
                                var frg = this.generate_double([elinks[i], elinks[i+1]], INCOMING);
                                links_remove.push(elinks[i].id);
                                links_remove.push(elinks[i+1].id);
                                fragments.push(frg);
                            }
                        }
                    }
                    else {
                        var chosen_p = !elinks[elinks.length - 1].flagged ? elinks[elinks.length - 1] : null;
                        links_remove.push(elinks[elinks.length - 1].id);
                        var frg_p = this.generate_single(chosen_p);
                        for (var i = 0; i < (elinks.length - 1); i+=2) {
                            if(!elinks[i].flagged && !elinks[i+1].flagged){
                                var frg = this.generate_double([elinks[i], elinks[i+1]], INCOMING);
                                links_remove.push(elinks[i].id);
                                links_remove.push(elinks[i+1].id);
                                fragments.push(frg);
                            }
                        }
                        fragments.push(frg_p);
                    }
                    this.prune_links(links_remove);
                }
        
                else if(candidate.param.chain == OUTGOING){
                    var elinks = candidate.param.related_links;
                    if(elinks.length % 2 == 0){
                        for (var i = 0; i < elinks.length; i+=2) {
                            if(!elinks[i].flagged && !elinks[i+1].flagged){
                                var frg = this.generate_double([elinks[i], elinks[i+1]], OUTGOING);
                                links_remove.push(elinks[i].id);
                                links_remove.push(elinks[i+1].id);
                                fragments.push(frg);
                            }
                        }
                    }
                    else {
                        var chosen_p = !elinks[elinks.length - 1].flagged ? elinks[elinks.length - 1] : null;
                        links_remove.push(elinks[elinks.length - 1].id);
                        var frg_p = this.generate_single(chosen_p);
                        for (var i = 0; i < (elinks.length - 1); i+=2) {
                            if(!elinks[i].flagged && !elinks[i+1].flagged){
                                var frg = this.generate_double([elinks[i], elinks[i+1]], OUTGOING);
                                links_remove.push(elinks[i].id);
                                links_remove.push(elinks[i+1].id);
                                fragments.push(frg);
                            }
        
                        }
                        fragments.push(frg_p);
                    }
                    this.prune_links(links_remove);
                }
        
            }
        };

        this.generate_node_frags = function(nodes){
            for (var i = 0; i < nodes.length; i++) {
                fragments.push("("+nodes[i].id+")");
            }
        };

        this.generate_single = function(link){
            if(link == null){
                return "NULL SET";
            }
            else {
                    if(link.directed){
                        return "(n"+link.source.id+")-[:NOLABEL]->(n"+link.target.id+")";
                    }
                    else {
                        return "(n"+link.source.id+")-[:NOLABEL]-(n"+link.target.id+")";
                    }
            }
        }

        this.generate_double = function(links, chain){

            if(chain == INCOMING){
                var link_str_left;
                var link_str_right;
                if(links[0].directed){
                    link_str_left = "-[:NOLABEL]->";
                }
                else {
                    link_str_left = "-[:NOLABEL]-";
                }
        
                if(links[1].directed){
                    link_str_right = "<-[:NOLABEL]-";
                }
                else {
                    link_str_right = "-[:NOLABEL]-";
                }
                return "(n"+links[0].source.id+")"+link_str_left+"(n"+links[0].target.id+")"+link_str_right+"(n"+links[1].source.id+")";
            }
            else if(chain == OUTGOING){
                var link_str_left;
                var link_str_right;
                if(links[0].directed){
                    link_str_left = "<-[:NOLABEL]-";
                }
                else {
                    link_str_left = "-[:NOLABEL]-";
                }
        
                if(links[1].directed){
                    link_str_right = "-[:NOLABEL]->";
                }
                else {
                    link_str_right = "-[:NOLABEL]-";
                }
                return "(n"+links[0].target.id+")"+link_str_left+"(n"+links[0].source.id+")"+link_str_right+"(n"+links[1].target.id+")";
            }
        }

        this.search_tgraph = function(link_id){
            for (var i = 0; i < TGRAPH.links.length; i++) {
                 var status = TGRAPH.links[i].id == link_id;
                 if(status &&  TGRAPH.links[i].flagged != true ){
                     return i;
                 }
            }
        }

        this.prune_links = function(links){
            var t_indices = [];
            for (var i = 0; i < links.length; i++) {
                t_indices.push(this.search_tgraph(links[i]));
            }
            this.prune_tgraph(t_indices);
        }

        this.combine_fragments  = function(frags){
            var text = "MATCH ";
            var lbo = (frags.length - 1);
            for (var i = 0; i < lbo; i++) {
                text += frags[i]+",";
            }
            text+=frags[lbo]+" RETURN *";
            return text;
        }

        this.get_related_links = function(param){
            var links = [];
            var count_tgraph = TGRAPH.links.length;
            if(param.chain == INCOMING){
                for (var i = 0; i < count_tgraph; i++) {
                    if(!TGRAPH.links[i].flagged){
                        var test = TGRAPH.links[i].target.id == param.node.node;
                        if(test) {
                            links.push(TGRAPH.links[i]);
                        }
                    }
                }
            }
            else if(param.chain == OUTGOING){
                for (var i = 0; i < TGRAPH.links.length; i++) {
                    if(!TGRAPH.links[i].flagged){
                        var test = TGRAPH.links[i].source.id == param.node.node;
                        if(test) {
                            links.push(TGRAPH.links[i]);
                        }
                    }
                }
            }
            return links;
        }

        this.worker_function = function(graph){
            var chains = this.generate_chains(graph);
            if(chains.incoming.length > 0 && chains.outgoing.length > 0){
                var candidate = this.calculate_candidate(chains);
                if(candidate.mode == SINGLE){
                    this.generate_fragment(SINGLE, null);
                    if(conn_gen == false){
                        var inodes = this.find_isolated_nodes(TGRAPH);
                        this.generate_node_frags(inodes);
                    }
                    return;
                }
                else if(candidate.mode == NORMAL){
                    candidate.param.related_links = this.get_related_links(candidate.param);
                    this.generate_fragment(NORMAL, candidate);
                    this.worker_function(TGRAPH); // the recusive point
                }
            }
            else {
                if(this.is_graph_flagged(graph)){
                    if(conn_gen == false){
                        var inodes = this.find_isolated_nodes(TGRAPH);
                        this.generate_node_frags(inodes);
                    }
                    return;
                }
                var inodes = this.find_isolated_nodes(TGRAPH);
                this.generate_node_frags(inodes);
            }
        };

        this.sort_chain = function (obj){
            var sortable=[];
            for(var key in obj)
                if(obj.hasOwnProperty(key))
                    sortable.push([obj[key].node, obj[key].count]);
            sortable.sort(function(a, b)
            {
            return a[1]-b[1];
            });
            return sortable;
        }
        
        this.sort_z = function(obj){
            var sortable=[];
            for(var key in obj)
                if(obj.hasOwnProperty(key))
                    sortable.push([obj[key].node, obj[key].count]);
            sortable.sort(function(a, b)
            {
            return a[0]-b[0];
            });
            return sortable;
        }

        this.find_largest = function (chain){
            var largest = chain[0];
            for (var i = 0; i < chain.length; i++) {
                if(chain[i].count > largest.count){
                    largest = chain[i];
                }
            }
            return largest;
        }

        this.calculate_candidate = function (chains){
            var inc = chains.incoming;
            var outc = chains.outgoing;
            var large_in = this.find_largest(inc);
            var large_out = this.find_largest(outc);
            var count_out = large_out.count;
            var count_in = large_in.count;
        
            if(count_in == count_out){
                if(count_in == 1 && count_out == 1){
                    return { mode: SINGLE, param: null };
                }
                else {
                    var chosen_one = this.pick_random([{ chain: INCOMING, node: large_in }, { chain: OUTGOING, node : large_out}]);
                    return { mode: NORMAL, param: chosen_one };
                }
            }
            else if(large_in.count > large_out.count){
                var chosen_one = { chain: INCOMING, node: large_in};
                return { mode: NORMAL, param: chosen_one };
            }
            else if(large_in.count < large_out.count){
                var chosen_one = {chain: OUTGOING, node: large_out};
                return { mode: NORMAL, param: chosen_one };
            }
        }

        this.reverse_link = function(link){
            var tmp = link.source;
            link.source = link.target;
            link.target = tmp;
            return link;
        }

        this.get_chance = function(){
            var val = Math.round(Math.random() % 2);
            return val == 0 ? false : true;
        }

        this.pick_random = function(set){
            var index = Math.round((Math.random() % 2));
            return set[index]
        }

        this.generate_query = function(input_graph){
            if(input_graph.nodes.length == 0) {
                console.error("No Nodes in your Query");
                return;
            }
            // ** Starting Point ** //
            TGRAPH = input_graph;
            fragments = []; // Empty the fragments array
            this.worker_function(TGRAPH);
            
            if(fragments.length > 0){
                var cq = this.combine_fragments(fragments);
                //console.info("New Query: "+cq);
                return cq; // generated query for the Neo4j Database
            }
            console.error("Internal Fragments returned empty");
            return; // return undefined on error
        };

    }
    return Cygen;
}));
