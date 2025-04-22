import * as d3 from "d3"
import * as preprocess from "./preprocess"

// Adapted from https://observablehq.com/@d3/multi-line-chart/2
let currentChild: SVGSVGElement | null | undefined = undefined;

export function multiLineGraph(data: MedalAgg[]) {  
  const container = document.getElementById('viz1');
  if (!container)
    return;

  const width = container.clientWidth - 5;
  const height = container.clientHeight - 5;
  const marginTop = 40;
  const marginRight = 20;
  const marginBottom = 30;
  const marginLeft = 40;

  const x = d3.scaleLinear()
    .domain([d3.min(data, d => d.Year)!, d3.max(data, d => d.Year)!])
    .range([marginLeft, width! - marginRight]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.Medal_sum)!]).nice()
    .range([height! - marginBottom, marginTop])

  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; overflow: visible; font: 10px sans-serif;");

  // Add the horizontal axis.
  svg.append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

  // Add the vertical axis.
  svg.append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll(".tick line").clone()
        .attr("x2", width - marginLeft - marginRight)
        .attr("stroke-opacity", 0.1))
    .call(g => g.append("text")
        .attr("x", -marginLeft)
        .attr("y", 20)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text("Weighted medal count"));
  
  const pointsMap = data.map(d => ({
    x: +d.Year,
    y: +d.Medal_sum,
    team: d.Team
  }));  

  const points = data.map((d) => [x(d.Year), y(d.Medal_sum), d.Team, d.Medal_sum]);
  
  const color = d3.scaleOrdinal(d3.schemeTableau10)
    .domain(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999']);
  const groups = d3.group(pointsMap, d => d.team);
  
  const line = d3.line<{ x: number; y: number }>()
    .x(d => x(d.x))
    .y(d => y(d.y))
    .curve(d3.curveCardinal.tension(0.5));

  const path = svg.append("g")
    .attr("fill", "none")
    .attr("stroke-width", 1.5)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .selectAll("path")
    .data(groups.values())
    .join("path")
    .attr("stroke",  function([team]: any){ return color(team) })
    .style("mix-blend-mode", "multiply")
    .attr("d", line)
    .each(function () {
      const totalLength = (this as SVGPathElement).getTotalLength();
      d3.select(this)
        .attr("stroke-dasharray", totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(1500)
        .ease(d3.easeCubicInOut)
        .attr("stroke-dashoffset", 0);
    });;

  // Add an invisible layer for the interactive tip.
  const dot = svg.append("g")
    .attr("display", "none");

  dot.append("circle")
    .attr("r", 2.5);

  dot.append("text")
    .attr("text-anchor", "middle")
    .attr("y", -8);

  svg
    .on("pointerenter", pointerentered)
    .on("pointermove", pointermoved)
    .on("pointerleave", pointerleft)
    .on("touchstart", event => event.preventDefault());
  
  if (currentChild) {
    container.removeChild(currentChild);
  }
  container.appendChild(svg.node()!);

  currentChild = svg.node();

  // When the pointer moves, find the closest point, update the interactive tip, and highlight
  // the corresponding line. Note: we don't actually use Voronoi here, since an exhaustive search
  // is fast enough.
  function pointermoved(event: any) {
    const [xm, ym] = d3.pointer(event);
    const i = d3.leastIndex(points, ([x, y]: any) => Math.hypot(x - xm, y - ym));
    const [x, y, k, n] = points[i!];
    path.style("stroke", (x) => x[0].team === k ? null : "#ddd").filter((x) => x[0].team === k).raise();
    dot.attr("transform", `translate(${x},${y})`);
    dot.select("text").text(`${k}, ${n}`);
    svg.property("value", data[i!]).dispatch("input");
  }
    
  function pointerentered() {
    path.style("mix-blend-mode", null).style("stroke", "#ddd");
    dot.attr("display", null);
  }

  function pointerleft() {
    path.style("mix-blend-mode", "multiply").style("stroke", null);
    dot.attr("display", "none");
    svg.node()!.setAttribute('value', '');
    svg.dispatch("input");
  }
}

export function streamGraph(data: MedalAgg[]) {
  const container = document.getElementById('viz2');
  if (!container)
    return;

  const width = container.clientWidth - 5;
  const height = container.clientHeight - 5;
  const marginTop = 40;
  const marginRight = 20;
  const marginBottom = 30;
  const marginLeft = 40;

  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; overflow: visible; font: 10px sans-serif;");

  const x = d3.scaleLinear()
    .domain([d3.min(data, d => d.Year)!, d3.max(data, d => d.Year)!])
    .range([marginLeft, width! - marginRight]);

  const y = d3.scaleLinear()
    .domain([-d3.max(data, d => d.Medal_sum)!, d3.max(data, d => d.Medal_sum)!]).nice()
    .range([height! - marginBottom, marginTop])

  // Add the vertical axis.
  svg.append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll(".tick line").clone()
        .attr("x2", width - marginLeft - marginRight)
        .attr("stroke-opacity", 0.1))
    .call(g => g.append("text")
        .attr("x", -marginLeft)
        .attr("y", 20)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text("Weighted medal count"));
  

  const series = d3.stack()
    .offset(d3.stackOffsetWiggle)
    .order(d3.stackOrderInsideOut)
    .keys(d3.union(data.map(d => d.Team)))
    .value(([, D]: any, key) => D.get(key).Medal_sum)
    //(d3.index(data, d => d.Year, d => d.Team));
    
}   