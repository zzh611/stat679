
function parse(data) {
    for (let i = 0; i < data.length; i++) {
      for (let t = 0; t < data[i].length; t++) {
        let dit = new Date(data[i][t].date);
        data[i][t].Time = dit;
        data[i][t].Date_string = `${dit.getFullYear()}-${1 + dit.getMonth()}-${dit.getDate()}`
        data[i][t].Date = new Date(data[i][t].Date_string)
        data[i][t].num = Number(data[i][t].calfresh)
      }
    }
    return data;
  }
// make scales for line chart
function make_scales(data, margin) {
    return {
      x: d3.scaleTime()
        .domain(d3.extent(data[0].map(d => d.Time)))
        .range([margin.left, 800 - margin.right]),
      y: d3.scaleLinear()
        .domain([0, 800000])
        .range([380 - margin.bottom, margin.top])
    }
  }

// draw lines with calfresh.csv
  function draw_lines(nested, scales) {
    let path_generator = d3.line()
      .x(d => scales.x(d.Time))
      .y(d => scales.y(d.num));

    d3.select("#lines")
      .selectAll("path")
      .data(nested).enter()
      .append("path")
      .attrs({
        class: "plain",
        d: path_generator
      })
  }

  
// draw x and y axes
  function draw_axes(scales, margin) {
    let x_axis = d3.axisBottom(scales.x)
    d3.select("#x_axis")
      .attr("transform", `translate(0, ${380 - margin.bottom})`)
      .call(x_axis)
  
    let y_axis = d3.axisLeft(scales.y)
    d3.select("#y_axis")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(y_axis)
  
  }

  // visualize line chart
  function visualize(data) {
    
    let margin = {top: 10, right: 10, bottom: 20, left: 50}
    let nested = parse(data)

    console.log(nested)
    let scales = make_scales(data, margin)
    draw_axes(scales, margin)
    draw_lines(nested, scales)
    
  }
 
// define some config for geomap
let width = 600,
  height = 600,
  scales = {
    fill: d3.scaleQuantize()
      .domain([3000, 35000])
      .range(d3.schemeGreens[9])
  }

  function slope_highlights(d) {
    

    d3.select("#lines")
      .selectAll("path")
      .attrs({
        class: e => e[0].county == d.county ? "plain" : "highlight",
        "stroke-width": e => e[0].county == d.county ? 1 : 0.2
      })

  }
  
// mouseover event to show county name
function mouseover(ev, d) {
  
  d3.select("#name")
    .select("text")
    .text(d.properties.county)

  d3.select("#map")
    .selectAll("path")
    .attr("stroke-width", e => e.properties.county == d.properties.county ? 2 : 0)

  slope_highlights(d.properties.county) 
}


// visualize geomap
function visualize_county(data) {

  let proj = d3.geoMercator()
    .fitSize([width, height], data)
  let path = d3.geoPath()
    .projection(proj);

  // color represent the average calfresh enrollment in this county
  d3.select("#map")
    .selectAll("path")
    .data(data.features).enter()
    .append("path")
    .attrs({
      d: path,
      fill: d => scales.fill(d.properties.calfresh),
      "stroke-width": 0
    })
    .on("mouseover", (ev, d) => mouseover(ev, d));

  // show county name
  d3.select("#name")
    .append("text")
    .attr("transform", "translate(300, 100)")
    .text("hover a glacier")
}

// read data from calfresh.csv

d3.json("calfresh.json")
  .then(visualize)
// read data from counties.geojson
d3.json("counties.geojson")
  .then(visualize_county)

