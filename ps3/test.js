
function read(data){
    calfresh = data;
    console.log(calfresh)
}
d3.csv("calfresh.csv", function(d) {
    return {
      county: d.county,
      date: d.date,
      medi_cal: d.medi_Cal,
      unemployment: d.unemployment,
      calfresh: d.calfresh
    };
  }).then(read);
console.log(calfresh)

d3.csv("calfresh.csv", function(d) {
    return {
      county: d.county,
      date: d.date,
      medi_cal: d.medi_Cal,
      unemployment: d.unemployment,
      calfresh: d.calfresh
    };
  });

  d3.csv("calfresh.csv", function(data) {
    data = Object.entries(data);
    console.log(data)
    filteredData = data.filter(function(row) {
        return row['county'] == d;
    });
    console.log(filteredData)
  });

  d3.select("#lines")
  .selectAll("path")
  .data([filteredData]).enter()
  .append("path")
  .attrs({
  class: "highlight",
  d: path_generator
  })
