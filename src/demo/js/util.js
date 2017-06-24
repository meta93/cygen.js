function sortChain(obj)
{
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
function sortZ(obj)
{
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
function findLargest(chain){
    var largest = chain[0];
    for (var i = 0; i < chain.length; i++) {
        if(chain[i].count > largest.count){
            largest = chain[i];
        }
    }
    return largest;
}