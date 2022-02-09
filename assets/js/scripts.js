import * as d3 from "https://cdn.skypack.dev/d3@7";

const WIDTH = 800;
const HEIGHT = 400;
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
      const minSec = minute.split(":");
      return +minSec[0] * 60 + +minSec[1];
    };

    const parseYear = (year) => new Date(Date.parse(year));

    const minuteScale = d3
      .scaleLinear()
      .domain([
        d3.min(data, (record) => parseMinutes(record["Time"])),
        d3.max(data, (record) => parseMinutes(record["Time"])),
      ])
      .range([PADDING, HEIGHT - PADDING]);

    const yearScale = d3
      .scaleTime()
      .domain([
        d3.min(data, (record) => parseYear(record["Year"])),
        d3.max(data, (record) => parseYear(record["Year"])),
      ])
      .range([PADDING, WIDTH - PADDING]);

    svg
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("data-xvalue", (d) => d["Years"])
      .attr("data-yvalue", (d) => {
        const date = new Date(Date.parse(`${d["Year"]}-01-01`));
        const minSec = d["Time"].split(":");

        date.setMinutes(minSec[0], minSec[1]);
        return date;
      })
      .attr("r", 5)
      .attr("cx", (d) => yearScale(parseYear(d["Year"])))
      .attr("cy", (d) => minuteScale(parseMinutes(d["Time"])));
  })
  .catch((err) => alert(err.message));
