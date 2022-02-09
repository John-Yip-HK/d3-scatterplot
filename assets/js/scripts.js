import * as d3 from "https://cdn.skypack.dev/d3@7";

const WIDTH = 800;
const HEIGHT = 400;
const PADDING = 50;

const container = d3.select("div#container");
const svg = container.append("svg").attr("width", WIDTH).attr("height", HEIGHT);
