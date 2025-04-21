import * as d3 from "d3"

// Based on https://observablehq.com/@d3/multi-line-chart/2
export function multiLineGraph(data: MedalAgg[]) {
  const container = document.getElementById('viz1');
  if (!container)
    return;

  const width = container.clientWidth;
  const height = container.clientHeight;
  const marginTop = 20;
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
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text("Weighted medal count"));
  
  const points = data.map((d) => [x(d.Year), y(d.Medal_sum), d.Team]);
  const groups = d3.rollup(points, v => Object.assign(v, {z: v[0][2]}), d => d[2]);   

  const line = d3.line();
  
  const path = svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
    .selectAll("path")
    .data(groups.values())
    .join("path")
      .style("mix-blend-mode", "multiply")
      .attr("d", d3.line());

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

  container.appendChild(svg.node()!);

  // When the pointer moves, find the closest point, update the interactive tip, and highlight
  // the corresponding line. Note: we don't actually use Voronoi here, since an exhaustive search
  // is fast enough.
  function pointermoved(event: any) {
    const [xm, ym] = d3.pointer(event);
    const i = d3.leastIndex(points, ([x, y]: any) => Math.hypot(x - xm, y - ym));
    const [x, y, k] = points[i!];
    path.style("stroke", ({z}) => z === k ? null : "#ddd").filter(({z}) => z === k).raise();
    dot.attr("transform", `translate(${x},${y})`);
    dot.select("text").text(k);
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