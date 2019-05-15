const svgWidth = 960;
const svgHeight = 600;

const margin = {
  top: 20,
  right: 40,
  bottom: 200,
  left: 100
};


const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

const svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
const chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Initial Params
let chosenXAxis = "poverty";
let chosenYAxis = "healthcare";

function xScale(data, chosenXAxis) {
  // create scales
  const xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

function yScale(data, chosenYAxis) {
  // mymax = d3.max(data, d=> d[chosenYAxis])
  const yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
      d3.max(data, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0])
  return yLinearScale
}

function renderXAxes(newXScale, xAxis) {
  const bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}


function renderYAxes(newYScale, yAxis) {
  const leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
      .duration(1000)
      .call(leftAxis);

  return yAxis;
}

function renderCircles(circlesGroup, newXScale, newYScale, chosenXaxis, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}


function renderLabels (labelsGroup, newXScale, newYScale, chosenXaxis, chosenYAxis) {
  labelsGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]));

  return labelsGroup;
}
//
// // function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    let label  = "";
    if (chosenXAxis === "poverty") {
        label = "poverty";
    }
    else if (chosenXAxis == "age"){
        label = "age";
    }
    else {
      label = "income"
    }



    const toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        // .style("background",'#BCC5F7')
        .html(function(d) {
            return (`${d.state}<br>
              ${label}: ${d[chosenXAxis]}<br>
              ${chosenYAxis}: ${d[chosenYAxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data, this);
    })
    // onmouseout event
    .on("mouseout", function(data, index) {
        toolTip.hide(data, this);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
(async function(){
  // TODO: figure out path to data, remove from this dir
    const data = await d3.csv("data.csv");
    // console.log (data)

    // parse data
    data.forEach(function(data) {
        data.income = +data.income;
        data.age = +data.age;
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.smokes = +data.smokes;
        data.obesity = +data.obesity;

    });

    // xLinearScale function above csv import
    let xLinearScale = xScale(data, chosenXAxis);
    let yLinearScale = yScale(data, chosenYAxis)

    // Create initial axis functions
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    let xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    let yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // append initial circles
    let circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 10)
        .attr("fill", "blue")
        .attr("opacity", ".5");
        // .attr("text", d => d.state);

      // TODO: figure out how to put text in the background

    let stateText = chartGroup.selectAll(".stateText")
        .data(data)
        .enter()
        .append("text")
        .classed("stateText", true)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis])+5)
        .text(d => d.abbr)


    // Create group for axis labels
    const xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    const povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");

    const ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age");

    const incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Income");


    const yLabelsGroup = chartGroup.append("g").call(leftAxis);

    // append y axis
    const healthcareLabel = yLabelsGroup.append("text")
        .attr("x", -height/2)
        .attr("y", -40)
        .attr("value", "healthcare") // value to grab for event listener
        .classed("active", true)
        .attr("transform", `rotate(-90)`)
        .text("Lacks Healthcare (%)");

    const smokesLabel = yLabelsGroup.append("text")
        .attr("x", -height/2)
        .attr("y", -60)
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .attr("transform", `rotate(-90)`)
        .text("Smokes (%)");


    const obesityLabel = yLabelsGroup.append("text")
        .attr("x", -height/2)
        .attr("y", -80)
        .attr("value", "obesity") // value to grab for event listener
        .classed("inactive", true)
        .attr("transform", `rotate(-90)`)
        .text("Obesity (%)");

    // updateToolTip function above csv import
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
    // stateText = updateToolTip(chosenXAxis, chosenYAxis, stateText)
    // x axis labels event listener
    xLabelsGroup.selectAll("text")
        .on("click", function() {
        // get value of selection
        const value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
            // replaces chosenXAxis with value
            chosenXAxis = value;
            // updates x scale for new data
            xLinearScale = xScale(data, chosenXAxis);
            // updates x axis with transition
            xAxis = renderXAxes(xLinearScale, xAxis);
            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
            stateText = renderLabels(stateText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
            // stateText = updateToolTip(chosenXAxis, chosenYAxis, stateText)

            // changes classes to change bold text
            if (chosenXAxis === "age") {
                ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenXAxis === "poverty") {
                  ageLabel
                      .classed("active", false)
                      .classed("inactive", true);
                  povertyLabel
                      .classed("active", true)
                      .classed("inactive", false);
                  incomeLabel
                      .classed("active", false)
                      .classed("inactive", true);
            }

            else if (chosenXAxis === "income") {
                  ageLabel
                      .classed("active", false)
                      .classed("inactive", true);
                  povertyLabel
                      .classed("active", false)
                      .classed("inactive", true);
                  incomeLabel
                      .classed("active", true)
                      .classed("inactive", false);
            }
        }
    });

    yLabelsGroup.selectAll("text")
        .on("click", function() {
        // get value of selection
        const value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {

            // replaces chosenYAxis with value
            chosenYAxis = value;

            // console.log(chosenXAxis)

            // functions here found above csv import
            // updates y scale for new data
            yLinearScale = yScale(data, chosenYAxis);

            // updates y axis with transition
            // xAxis = renderXAxes(xLinearScale, xAxis);
            yAxis = renderYAxes(yLinearScale, yAxis)

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
            stateText = renderLabels(stateText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
            // stateText = updateToolTip(chosenXAxis, chosenYAxis, stateText)

            // changes classes to change bold text
            if (chosenYAxis === "healthcare") {
                healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenYAxis === "smokes") {
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", true)
                    .classed("inactive", false);
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }

            else if (chosenYAxis === "obesity") {
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obesityLabel
                  .classed("active", true)
                  .classed("inactive", false);
            }
        }
    });
})()
