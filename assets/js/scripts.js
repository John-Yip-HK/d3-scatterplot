import * as d3 from "https://cdn.skypack.dev/d3@7";

const WIDTH = 700;
const HEIGHT = 500;
const PADDING = 50;

const container = d3.select("div#container");
const svg = container
  .append("svg")
  .attr("id", "graph")
  .attr("width", WIDTH)
  .attr("height", HEIGHT);

fetch(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
)
  .then((res) => res.json())
  .then((data) => {
    const parseMinutes = (minute) => {
      const date = new Date();
      const minSec = minute.split(":");

      date.setMinutes(+minSec[0], +minSec[1]);
      return date;
    };

    const parseYear = (year) => new Date(Date.parse(year));

    const minuteScale = d3
      .scaleTime()
      .domain([
        d3.min(data, (record) => parseMinutes(record["Time"])),
        d3.max(data, (record) => parseMinutes(record["Time"])),
      ])
      .range([PADDING, HEIGHT - PADDING]);

    const yearScale = d3
      .scaleTime()
      .domain([
        parseYear(d3.min(data, (record) => record["Year"]) - 1),
        parseYear(d3.max(data, (record) => record["Year"]) + 1),
      ])
      .range([PADDING, WIDTH - PADDING]);

    // Credit: https://codepen.io/freeCodeCamp/pen/bgpXyK?editors=0010
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    const xAxis = d3.axisBottom(yearScale);
    const yAxis = d3.axisLeft(minuteScale).tickFormat(d3.timeFormat("%M:%S"));

    const tooltip = container.append("div").attr("id", "tooltip");

    function mouseOver(event) {
      const pointer = d3.pointer(event, d3.select("body").node());
      const circle = d3.select(this);

      const minSecTime = (dateStr) => {
        let splitDateStr = dateStr.split(" ")[4];
        splitDateStr = splitDateStr.split(":");
        let minute = splitDateStr[1];
        let second = splitDateStr[2];

        return minute + ":" + second;
      };

      let html = `${circle.attr("data-name")}: ${circle.attr(
        "data-nationality"
      )}<br>
      Year: ${circle.attr("data-xvalue")}, Time: ${minSecTime(
        circle.attr("data-yvalue")
      )}`;

      if (circle.attr("data-doping").length > 0) {
        html += `<br><br>${circle.attr("data-doping")}`;
      }

      tooltip
        .style("display", "block")
        .style("top", `${pointer[1]}px`)
        .style("left", `${pointer[0] + 20}px`)
        .attr("data-year", circle.attr("data-xvalue"))
        .html(html);
    }

    function mouseOut() {
      tooltip.style("display", "none").text("");
    }

    svg
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("data-xvalue", (d) => d["Year"])
      .attr("data-yvalue", (d) => parseMinutes(d["Time"]))
      .attr("data-name", (d) => d["Name"])
      .attr("data-nationality", (d) => d["Nationality"])
      .attr("data-doping", (d) => d["Doping"])
      .attr("r", 5)
      .attr("cx", (d) => yearScale(parseYear(d["Year"])))
      .attr("cy", (d) => minuteScale(parseMinutes(d["Time"])))
      .style("fill", (d) => colorScale(d["Doping"] !== ""))
      .style("fill-opacity", "0.8")
      .on("mouseover", mouseOver)
      .on("mouseout", mouseOut);

    // Credit: https://codepen.io/freeCodeCamp/pen/bgpXyK?editors=0010
    const legendContainer = svg.append("g").attr("id", "legend");

    const legend = legendContainer
      .selectAll("#legend")
      .data(colorScale.domain())
      .enter()
      .append("g")
      .attr("class", "legend-label")
      .attr("transform", function (d, i) {
        return "translate(0," + (HEIGHT / 2 - i * 20) + ")";
      });

    legend
      .append("rect")
      .attr("x", WIDTH - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", colorScale);

    legend
      .append("text")
      .attr("x", WIDTH - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function (d) {
        if (d) {
          return "Riders with doping allegations";
        } else {
          return "No doping allegations";
        }
      });

    svg
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${HEIGHT - PADDING})`)
      .call(xAxis);

    svg
      .append("g")
      .attr("id", "y-axis")
      .attr("transform", `translate(${PADDING}, 0)`)
      .call(yAxis);

    svg
      .append("text")
      .style("font-size", "0.5rem")
      .attr("transform", "rotate(-90)")
      .attr("x", -WIDTH / 4)
      .attr("y", 10)
      .text("Time in Minutes");
  })
  .catch((err) => alert(err.message));
