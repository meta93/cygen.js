/*
Cygen.js Proof of concept
Author: Damoah Dominic Asare-Otieku, Damoah Dominic Dalyngton
Description: Proof of concept for the Cygen.js library.
License: GPLv3
*/

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


function is_graph_flagged(g){
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
function findIsolatedNodes(TGRAPH){
	var nodes = TGRAPH.nodes;
	var links = TGRAPH.links;
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
}
function generateNodeFrags(nodes){
	for (var i = 0; i < nodes.length; i++) {
		fragments.push("("+nodes[i].id+")");
	}
}
function generate_chains(graph){
	var chains = { incoming: [], outgoing: [] };
	if(is_graph_flagged(graph) || graph.links.length == 0){
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
}
function generate_cypher(){
	cypher_text = "Generated Cypher at "+new Date();
	set_cypher_textarea(cypher_text);
	if(GRAPH.nodes.length == 0) {
		console.log("No Nodes in your Query");
		cypher_text = "No Nodes in Query";
		set_cypher_textarea(cypher_text);
		return;
	}

	// ** Starting Point ** //
	TGRAPH = GRAPH;
	console.dir(TGRAPH);
	fragments = []; // Empty the fragments array
	worker_function(TGRAPH); // Recursion
	if(fragments.length > 0){
		var cq = combine_fragments(fragments);
		console.log(cq);
		set_cypher_textarea(cq);
	}
	else {
		// Add hint ("Add Links to the Graph")
	}
}
function generate_fragment(mode,candidate){
	var t_indices = [];
	var links_remove = [];
	if(mode == SINGLE){
		for (var i = 0; i < TGRAPH.links.length; i++) {
			if(!TGRAPH.links[i].flagged){
				var frg = generate_single(TGRAPH.links[i]);
				t_indices.push(i);
				fragments.push(frg);
			}
		}
		prune_tgraph(t_indices);
	}
	else if(mode == NORMAL){
		if(candidate.param.chain == INCOMING){
			var elinks = candidate.param.related_links;
			if(elinks.length % 2 == 0){
				for (var i = 0; i < elinks.length; i+=2) {
					if(!elinks[i].flagged && !elinks[i+1].flagged){
						var frg = generate_double([elinks[i], elinks[i+1]], INCOMING);
						links_remove.push(elinks[i].id);
						links_remove.push(elinks[i+1].id);
						fragments.push(frg);
					}
				}
			}
			else {
				var chosen_p = !elinks[elinks.length - 1].flagged ? elinks[elinks.length - 1] : null;
				links_remove.push(elinks[elinks.length - 1].id);
				var frg_p = generate_single(chosen_p);
				for (var i = 0; i < (elinks.length - 1); i+=2) {
					if(!elinks[i].flagged && !elinks[i+1].flagged){
						var frg = generate_double([elinks[i], elinks[i+1]], INCOMING);
						links_remove.push(elinks[i].id);
						links_remove.push(elinks[i+1].id);
						fragments.push(frg);
					}
				}
				fragments.push(frg_p);
			}
			prune_links(links_remove);
		}

		else if(candidate.param.chain == OUTGOING){
			var elinks = candidate.param.related_links;
			if(elinks.length % 2 == 0){
				for (var i = 0; i < elinks.length; i+=2) {
					if(!elinks[i].flagged && !elinks[i+1].flagged){
						var frg = generate_double([elinks[i], elinks[i+1]], OUTGOING);
						links_remove.push(elinks[i].id);
						links_remove.push(elinks[i+1].id);
						fragments.push(frg);
					}
				}
			}
			else {
				var chosen_p = !elinks[elinks.length - 1].flagged ? elinks[elinks.length - 1] : null;
				links_remove.push(elinks[elinks.length - 1].id);
				var frg_p = generate_single(chosen_p);
				for (var i = 0; i < (elinks.length - 1); i+=2) {
					if(!elinks[i].flagged && !elinks[i+1].flagged){
						var frg = generate_double([elinks[i], elinks[i+1]], OUTGOING);
						links_remove.push(elinks[i].id);
						links_remove.push(elinks[i+1].id);
						fragments.push(frg);
					}

				}
				fragments.push(frg_p);
			}
			prune_links(links_remove);
		}

	}
}
function generate_single(link){
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
function generate_double(links, chain){

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
function prune_tgraph(indices){
	for (var i = 0; i < indices.length; i++) {
		TGRAPH.links[indices[i]].flagged = true;
	}
}
function search_tgraph(link_id){
	for (var i = 0; i < TGRAPH.links.length; i++) {

		 var status = TGRAPH.links[i].id == link_id;
		 if(status &&  TGRAPH.links[i].flagged != true ){
		 	return i;
		 }
	}
}
function prune_links(links){
	var t_indices = [];
	for (var i = 0; i < links.length; i++) {
		t_indices.push(search_tgraph(links[i]));
	}
	prune_tgraph(t_indices);
}
function combine_fragments(frags){
	var text = "MATCH ";
	var lbo = (frags.length - 1);
	for (var i = 0; i < lbo; i++) {
		text += frags[i]+",";
	}
	text+=frags[lbo]+" RETURN *";
	return text;
}
function get_related_links(param){
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
function worker_function(graph){
	var chains = generate_chains(graph);
	if(chains.incoming.length > 0 && chains.outgoing.length > 0){
		var candidate = calculate_candidate(chains);
		if(candidate.mode ==œ SINGLE){
			generate_fragment(SINGLE, null);
			if(conn_gen == false){
				var inodes = findIsolatedNodes(TGRAPH);
				generateNodeFrags(inodes);
			}
			return;
		}
		else if(candidate.mode == NORMAL){
			candidate.param.related_links = get_related_links(candidate.param);
			generate_fragment(NORMAL, candidate);
			worker_function(TGRAPH);
		}
	}
	else {
		if(is_graph_flagged(graph)){
			if(conn_gen == false){
				var inodes = findIsolatedNodes(TGRAPH);
				generateNodeFrags(inodes);
			}
			return;
		}
		var inodes = findIsolatedNodes(TGRAPH);
		generateNodeFrags(inodes);
	}
}
function pick_random(set){
	var index = Math.round((Math.random() % 2));
	console.log(index);
	return set[index]
}
function calculate_candidate(chains){
	inc = chains.incoming;
	outc = chains.outgoing;
	large_in = findLargest(inc);
	large_out = findLargest(outc);
	var count_out = large_out.count;
	var count_in = large_in.count;

	if(count_in == count_out){
		if(count_in == 1 && count_out == 1){
			return { mode: SINGLE, param: null };
		}
		else {
			var chosen_one = pick_random([{ chain: INCOMING, node: large_in }, { chain: OUTGOING, node : large_out}]);
			console.dir(chosen_one);
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
function setup_events(){
	$("#reset-btn").click(function(e){
		$("#order").val(10);
		$("#size").val(5);
		$("#chk_conn").prop('checked', true);
		$("#chk_bidirectional").prop('checked', false);
		$("#chk_pseudo").prop('checked', false);
		$("#chk_optimize").prop('checked', false);
		$("#chk_non_directed_mix").prop('checked', false);
		$("#chk_non_directed_mix_full").prop('checked', false);

		update_graph_value();
	});
	$("#order").on("change", function(e){
		update_graph_value();
	});
	$("#size").on("change", function(e){
		update_graph_value();
	});
	$("#generate-btn").click(function(e){
		update_graph_value();
	});
	$(".swap-btn").click(function(e){
		perform_swap();
	});
	$("#chk_conn").change(function(){
		conn_gen = $("#chk_conn").is(':checked');
		update_graph_value();
	});
	$("#chk_bidirectional").change(function(){
		bidirectional_gen = $("#chk_bidirectional").is(':checked');
		update_graph_value();
	});
	$("#chk_pseudo").change(function(){
		pseudo_gen = $("#chk_pseudo").is(':checked');
		update_graph_value();
	});
	$("#chk_optimize").change(function(){
		optimize_query = $("#chk_optimize").is(':checked');
	});
	$("#chk_non_directed_mix").change(function(){
		non_directed_mix = $("#chk_non_directed_mix").is(':checked');
		if(non_directed_mix){
			non_directed_mix_full = false;
			$("#chk_non_directed_mix_full").prop('checked', false);
		}
		update_graph_value();
	});
	$("#chk_non_directed_mix_full").change(function(){
		non_directed_mix_full = $("#chk_non_directed_mix_full").is(':checked');
		if(non_directed_mix_full){
			non_directed_mix = false;
			$("#chk_non_directed_mix").prop('checked', false);
		}
		update_graph_value();
	});
}
function init_graph(){

	$("#version").html(version);
	var so = $("#order").val();
	var ss = $("#size").val();
	bidirectional_gen = $("#chk_bidirectional").is(':checked');
	conn_gen = $("#chk_conn").is(':checked');
	pseudo_gen = $("#chk_pseudo").is(':checked');
	optimize_query = $("#chk_optimize").is(':checked');
	non_directed_mix = $("#chk_non_directed_mix").is(':checked');
	non_directed_mix_full = $("#chk_non_directed_mix_full").is(':checked');

	var ng = generate_random_graph(so, ss, conn_gen, bidirectional_gen,pseudo_gen,non_directed_mix,non_directed_mix_full);
	GRAPH = ng;
 	instance = greuler({
		  target: '#viewport',
		  width: window.innerWidth,
		  height: window.innerHeight,
		  data: ng,
		  avoidOverlaps: true,
		  linkDistance: 40,
		  charge: -1000
	});
	instance.update();
}
function update_graph(graph){
		var ng = graph;
		GRAPH = ng;
		instance.graph.removeNodes(instance.graph.nodes);
		instance.graph.removeEdges(instance.graph.edges);
		for(var i = 0; i < ng.nodes.length; i++){
			instance.graph.addNode(ng.nodes[i]);
		}
		for(var j = 0; j < ng.links.length; j++){
			instance.graph.addEdge(ng.links[j]);
		}
		instance.update();
}
function update_graph_value(){
		var so = $("#order").val();
		var ss = $("#size").val();
		bidirectional_gen = $("#chk_bidirectional").is(':checked');
		conn_gen = $("#chk_conn").is(':checked');
		pseudo_gen = $("#chk_pseudo").is(':checked');
		optimize_query = $("#chk_optimize").is(':checked');
		non_directed_mix = $("#chk_non_directed_mix").is(':checked');
		non_directed_mix_full = $("#chk_non_directed_mix_full").is(':checked');

		var ng = generate_random_graph(so, ss, conn_gen, bidirectional_gen,pseudo_gen,non_directed_mix,non_directed_mix_full);
		update_graph(ng);
		generate_cypher();
}
function reverse_link(link){
	var tmp = link.source;
	link.source = link.target;
	link.target = tmp;
	return link;
}
function get_chance(){
	var val = Math.round(Math.random() % 2);
	console.log("Val is "+val);
	if(val == 0){
		return false;
	}
	return true;
}
function generate_random_graph(o,s,conn,bdg,psu,non_d_mix,non_d_mix_full){
	var rand_graph = greuler.Graph.random({
	    order: o,
	    size: s,
	    connected: conn,
	    multiGraph: bdg,
	    pseudoGraph: psu
	  });
	$.each(rand_graph.links, function(index, edge){
		if(non_d_mix){
			console.log("Gotten DMix");
			if(get_chance()){
				console.log("No Direction");
				edge.directed = false;
			}
			else {
				edge.directed = true;
				console.log("No Direction");
			}
			edge.flagged = false;
		}
		else if(non_d_mix_full){
			edge.directed = false;
			edge.flagged = false;
		}
		else {
			edge.directed = true;
			edge.flagged = false;
		}

	});

	$.each(rand_graph.nodes, function(index, node){
		node.fill = NODE_FILL;
		node.r = 17;
		node.label = "N"+node.id;
	});
	console.dir(rand_graph);
	return rand_graph;
}
function perform_swap(){
	var so = $("#order").val();
	var ss = $("#size").val();
	so^=ss;
	ss^=so;
	so^=ss;
	$("#order").val(so);
	$("#size").val(ss);
	update_graph_value();
}
function print_table(chainv, name){
	console.log(name+" table\n===================\n");
	var ec = 0;
	for (var i = 0; i < chainv.length; i++) {
		console.log(chainv[i][0]+"\t\t\t"+chainv[i][1]);
		ec+=chainv[i][1];
	};
	console.log("Edge Count: "+ec);
}
function set_cypher_textarea(text){
	$("#cypher-text-query").html(text);
	myCodeMirror.setValue(text);
}
function apply_code_mirror(){
	myCodeMirror = CodeMirror.fromTextArea($("#cypher-text-query")[0], {
		lineWrapping : true,
		readOnly: "nocursor"
	});
}
function apply_draggable_widgets(){
	 $('body').on('mousedown', '.toolbar', function(e) {
        $(this).parent().addClass('draggable').parents().on('mousemove', function(e) {
            $('.draggable').offset({
                top: e.pageY - $('.draggable').outerHeight() / 2,
                left: e.pageX - $('.draggable').outerWidth() / 2
            }).on('mouseup', function() {
                $(this).parent().removeClass('draggable');
            });
        });
        e.preventDefault();
    }).on('mouseup', function() {
        $('.draggable').removeClass('draggable');
    });
}
function apply_visuals () {
	apply_code_mirror();
	apply_draggable_widgets();
}

$(function(){
	init_graph();
	setup_events();
	apply_visuals();
	generate_cypher();
});
