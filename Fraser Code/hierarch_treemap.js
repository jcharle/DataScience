var width = 650,
    height = 500;

var fill = d3.scale.ordinal()
    .range(["#f0f0f0", "#d9d9d9", "#bdbdbd"]);

var stroke = d3.scale.linear()
    .domain([0, 1e4])
    .range(["brown", "steelblue"]);

var treemap = d3.layout.treemap()
    .size([width, height])
    .value(function(d) { return d.size; });

var bundle = d3.layout.bundle();

var div = d3.select("#area5").append("div")
    .style("position", "relative")
    .style("width", width + "px")
    .style("height", height + "px");

var line = d3.svg.line()
    .interpolate("bundle")
    .tension(.85)
    .x(function(d) { return d.x + d.dx / 2; })
    .y(function(d) { return d.y + d.dy / 2; });

d3.csv("course_hierarch2.csv", function(d) {

console.log(d);
map_temp = {}
data_temp = []

//For calculating keys in a map
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

//For getting elements from the map based on their index
function get_map_elem(map, index){
  var counter = 0;
  for(key in map){
    if(counter==index) return key;
    counter ++;
  }
}


d.forEach(function(d){
  var key_string = "DataScience." + d.Course + "." + d.Chapter.substring(1, d.Chapter.length)
  if(!map_temp[key_string]){
    if(d.Chap_hour=="") d.Chap_hour = 5
    map_temp[key_string] = {"name":key_string,"size":parseFloat(d.Chap_hour),"imports":[]};
  }
})

$.each(map_temp, function (i, val) {
  // console.log(map_temp[i])
  var num_imp = Math.floor(Math.random() * 5) + 1; //Random number between 1 & 5
  for(i=0; i<num_imp; i++){
    // console.log(Object.size(map_temp))
    var index = Math.floor(Math.random() * Object.size(map_temp));
    if(index != i ){
      val.imports.push(get_map_elem(map_temp, index));
    }
  }
  // console.log(val)
  data_temp.push(val);
});


  var nodes = treemap.nodes(packages.root(data_temp)),
      links = packages.imports(nodes);

  div.selectAll(".cell")
      .data(nodes)
    .enter().append("div")
      .attr("class", "cell")
      .style("background-color", function(d) { return d.children ? fill(d.key) : null; })
      .call(cell)
      .text(function(d) { return d.children ? null : d.key; });

  div.append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("position", "absolute")
    .selectAll(".chain")
      .data(bundle(links))
    .enter().append("path")
      .attr("class", "chain")
      .attr("d", line)
      .style("stroke", function(d) { return stroke(d[0].value); });
});

function cell() {
  this.style("left", function(d) { return d.x + "px"; })
      .style("top", function(d) { return d.y + "px"; })
      .style("width", function(d) { return d.dx - 1 + "px"; })
      .style("height", function(d) { return d.dy - 1 + "px"; });
}

var packages = {
 
  // Lazily construct the package hierarchy from class names.
  root: function(classes) {
    var map = {};
 
    function find(name, data) {
      var node = map[name], i;
      if (!node) {
        node = map[name] = data || {name: name, children: []};
        if (name.length) {
          node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
          node.parent.children.push(node);
          node.key = name.substring(i + 1);
        }
      }
      return node;
    }
 
    classes.forEach(function(d) {
      find(d.name, d);
    });
 
    return map[""];
  },
 
  // Return a list of imports for the given array of nodes.
  imports: function(nodes) {
    var map = {},
        imports = [];
 
    // Compute a map from name to node.
    nodes.forEach(function(d) {
      map[d.name] = d;
    });
 
    // For each import, construct a link from the source to target node.
    nodes.forEach(function(d) {
      if (d.imports) d.imports.forEach(function(i) {
        imports.push({source: map[d.name], target: map[i]});
      });
    });
 
    return imports;
  }
};