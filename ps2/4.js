let bar_ages = [],
generator = d3.randomUniform(0, 500),
id = 0;

d3.select("body")
  .select("#my_button")
  .on("mousedown", update)

function update() {
    bar_ages = bar_ages.map(d => { return {id: d.id, age: d.age + 1, height: d.height }})
    bar_ages.push({age: 0, height: generator(), id: id});
    bar_ages = bar_ages.filter(d => d.age < 5)
    id += 1;

    let selection = d3.select("svg")
    .selectAll("rect")
    .data(bar_ages, d => d.id)

    selection.enter()
    .append("rect")
    .attrs({
        x: 0, 
        y: 500,
        width: 80, 
        height: d => d.height
    })

  d3.select("svg")
    .selectAll("rect")
    .transition()
    .duration(1000)
    .attrs({
        x: d => 100 * d.age, 
        y: d => 500 - d.height,
        width: 80, 
        height: d => d.height,
        fill: "black"
    })

  selection.exit()
    .transition()
    .duration(500)
    .attr("y", 500)
    .remove()
}
