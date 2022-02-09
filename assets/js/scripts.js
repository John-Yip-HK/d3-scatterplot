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

    const xAxis = d3.axisBottom(yearScale);
    const yAxis = d3.axisLeft(minuteScale).tickFormat(d3.timeFormat("%M:%S"));

    const tooltip = container.append("div").attr("id", "tooltip");

    function pointerOver(event) {
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

    function pointerOut() {
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
      .style("fill", (d) =>
        d["Doping"].length > 0 ? "rgb(31, 119, 180)" : "orange"
      )
      .style("fill-opacity", "0.8")
      .on("mouseover", pointerOver)
      .on("mouseout", pointerOut);

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
