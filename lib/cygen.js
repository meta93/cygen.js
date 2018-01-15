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
        this.say_hello  = function(){
        console.log("Hello");
        };

        this.generate_query = function(input_graph){
            return "I am a query";
        };
    }
    return Cygen;
}));
