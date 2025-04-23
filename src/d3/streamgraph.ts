import * as d3 from "d3"
import * as preprocess from "./preprocess"

// Adapted from https://observablehq.com/@d3/normalized-stacked-area-chart/2
// Interactivity elements from https://d3-graph-gallery.com/graph/streamgraph_template.html
let currentChild: SVGSVGElement | null | undefined = undefined;

export function draw(data: MedalAgg[]) {
  const container = document.getElementById('viz2');
  if (!container)
    return;

  const width = container.clientWidth - 5;
  const height = container.clientHeight - 5;
  const marginTop = 40;
  const marginRight = 20;
  const marginBottom = 30;
  const marginLeft = 40;

  const x = d3.scaleLinear()
    .domain(d3.extent(data.map(d => d.Year)) as any)
    .range([marginLeft, width! - marginRight]);

  const y = d3.scaleLinear()
    .rangeRound([height! - marginBottom, marginTop])
  

  const index = d3.index(data, d => d.Year, d => d.Team); // Map<Year, Map<Team, Datum>>

  const keys = Array.from(d3.union(data.map(d => d.Team)))

  const series = d3.stack()
    .offset(d3.stackOffsetExpand)
    .order(d3.stackOrderDescending)
    .keys(keys) // returns array of team names
    .value(([, D]: any, team) => D.get(team)?.Medal_sum ?? 0)
    (index as any); // type checking didn't like this and idk why
  
  console.log(series);
  
  const color = d3.scaleOrdinal()
    .domain(series.map(d => d.key))
    .range(d3.schemeTableau10);

  const area = d3.area()
    .x(d => x((d as any).data[0]))
    .y0(d => y(d[0]))
    .y1(d => y(d[1]));

  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto;");

  // Append a path for each series.
  svg.append("g")
    .selectAll()
    .data(series)
    .join("path")
      .attr("fill", (d) => color(d.key) as any)
      .attr("d", area as any)
      .attr("class", "myArea")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
    .append("title")
      .text(d => d.key);

  // Append the x axis, and remove the domain line.
  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .call(g => g.select(".domain").remove());
  
  // Add the y axis, remove the domain line, add grid lines and a label.
  svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y).ticks(height / 80, "%"))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line")
        .filter(d => d === 0 || d === 1)
        .clone()
          .attr("x2", width - marginLeft - marginRight))
      .call(g => g.append("text")
          .attr("x", -marginLeft)
          .attr("y", 25)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text("Weighted medal sum (%)"));

  const Tooltip = svg.append("text")
    .attr("x", width / 2)
    .attr("y", marginTop / 2)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .attr("fill", "currentColor")
    .style("pointer-events", "none")
    .style("opacity", 0);

  function mouseover(d: any) {
    Tooltip.style("opacity", 1)
    d3.selectAll(".myArea").style("opacity", .2)
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1)
  }

  function mousemove(d: any,i: any) {
    Tooltip.text(i.key)
  }

  function mouseleave(d: any) {
    Tooltip.style("opacity", 0)
    d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none")
  }
    
  if (currentChild) {
    container.removeChild(currentChild);
  }
  container.appendChild(svg.node()!);

  currentChild = svg.node();

}   