  function make_scales(data, margin) {
    return {
      x: d3.scaleTime()
        .domain(d3.extent(data.map(d => d.date)))
        .range([margin.left, 800 - margin.right]),
      y: d3.scaleLinear()
        .domain(d3.extent(data.map(d => d.calfresh)))
        .range([600 - margin.bottom, margin.top])
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
      .attr("transform", `translate(0, ${600 - margin.bottom})`)
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
  
  d3.csv("calfresh.csv", d3.autoType)
    .then(visualize)
  