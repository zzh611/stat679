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
      .range([580 - margin.bottom, margin.top])
  }
}
  
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
  
  function draw_axes(scales, margin) {
    let x_axis = d3.axisBottom(scales.x)
    d3.select("#x_axis")
      .attr("transform", `translate(0, ${580 - margin.bottom})`)
      .call(x_axis)
  
    let y_axis = d3.axisLeft(scales.y)
    d3.select("#y_axis")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(y_axis)
  
  }
  
  function visualize(data) {
    let margin = {top: 10, right: 10, bottom: 20, left: 50}
    let nested = parse(data)
    let scales = make_scales(data, margin)
    draw_lines(nested, scales)
    draw_axes(scales, margin)
  }
  
d3.json("calfresh.json")
  .then(visualize)
  