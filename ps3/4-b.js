function make_scales(data, margin) {
    return {
      x: d3.scaleTime()
        .domain(d3.extent(data.map(d => d.date)))
        .range([margin.left, 800 - margin.right]),
      y: d3.scaleLinear()
        .domain(d3.extent(data.map(d => d.calfresh)))
        .range([380 - margin.bottom, margin.top])
    }
  }
  
  function draw_lines(nested, scales) {
    let path_generator = d3.line()
      .x(d => scales.x(d.date))
      .y(d => scales.y(d.calfresh));

    d3.select("#lines")
      .selectAll("path")
      .data([nested]).enter()
      .append("path")
      .attrs({
        class: "plain",
        d: path_generator
      })
  }
  
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
  
  function visualize(data) {
    let margin = {top: 10, right: 10, bottom: 20, left: 50}
    let nested = data
    let scales = make_scales(data, margin)
    draw_lines(nested, scales)
    draw_axes(scales, margin)
  }
  
let width = 600,
  height = 600,
  scales = {
    fill: d3.scaleQuantize()
      .domain([3000, 35000])
      .range(d3.schemeGreens[9])
  }

function mouseover(d) {
  d3.select("#name")
    .select("text")
    .text(d.properties.county)

  d3.select("#map")
    .selectAll("path")
    .attr("stroke-width", e => e.properties.county == d.properties.county ? 2 : 0)
}

function visualize_county(data) {

  let proj = d3.geoMercator()
    .fitSize([width, height], data)
  let path = d3.geoPath()
    .projection(proj);

  d3.select("#map")
    .selectAll("path")
    .data(data.features).enter()
    .append("path")
    .attrs({
      d: path,
      fill: d => scales.fill(d.properties.calfresh),
      "stroke-width": 0
    })
    .on("mouseover", (_, d) => mouseover(d));

  d3.select("#name")
    .append("text")
    .attr("transform", "translate(300, 100)")
    .text("hover a glacier")
}
d3.csv("calfresh.csv", d3.autoType)
  .then(visualize)

d3.json("counties.geojson")
  .then(visualize_county)

