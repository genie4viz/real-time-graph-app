import React, { useEffect, useRef } from "react";
import io from 'socket.io-client';
import LineChart from '../LineChart';
import * as d3 from 'd3';

function App() {
  const width = 1000, height = 400, margin = 50;
  const svgRef = useRef();

  useEffect(() => {
    let x = d3.scaleBand().rangeRound([margin, width - margin]).padding(0.1),
        y = d3.scaleLinear().rangeRound([height - margin, margin]);
    
    let data = [];
    for(let i = -100; i <= 90; i += 10){
      data.push({
        value: 0,
        range: `${i}~${i + 10}`
      });
    }
    
    // set the domains of the axes
    x.domain(data.map((d) => d.range));
    y.domain([0, 1]);//d3.max(data, ((d) => d.value))

    // add the svg elements
    d3.select(svgRef.current).append("g")
        .attr("class", "axis axis--x")
        .attr("transform", `translate(0,${height - margin})`)
        .call(d3.axisBottom().scale(x));

    const y_axis = d3.select(svgRef.current).append("g")
        .attr("class", "axis axis--y")
        .attr("transform", `translate(${margin},0)`)
        .call(y.axis = d3.axisLeft().scale(y).ticks(10))
      // .append("text")
      //   .attr("transform", "rotate(-90)")
      //   .attr("y", 6)
      //   .attr("dy", "0.71em")
      //   .attr("text-anchor", "end")
      //   .text("Counts");

    // create the bars
    var g = d3.select(svgRef.current).append('g')
    g
      .selectAll(".bar")
      .data(data)
      .enter().append("rect")
        .attr("class", "bar")
        .attr('fill', 'steelblue')
        .attr("x", d => x(d.range))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => height - 50 - y(d.value));
    
    function tick(v) {      
      for(let i = -100; i <= 90; i += 10){
        if(i <= v && i + 10 > v){
          data.filter(e => e.range === `${i}~${i + 10}`)[0].value++;
        }
      }
      let maxCounts = d3.max(data, ((d) => d.value));
      y.domain([0, maxCounts < 1 ? 1 : maxCounts]);
      y_axis
        .transition()
        .duration(1000)
        .ease(d3.easeLinear, 2)
        .call(y.axis);

      d3.selectAll(".bar")
        .data(data)
        .transition().duration(1000)
        .attr("x", d => x(d.range))
        .attr("y", d => y(d.value))        
        .attr("height", d => height - 50 - y(d.value));
      
    }
    
    try {
      const ioClient = io.connect("http://localhost:5050");
      ioClient.on("data", msg => tick(msg.value));
    } catch (err) {
      console.log(err);
    }
    return () => io.close();
  }, []);
  // useEffect(() => {    
  //   let limit = 30,
  //     now = new Date();

  //   let current = [];
  //   for(let i = 0; i < limit; i++){
  //     current.push({
  //       time: now - (limit - i + 1) * 1000,
  //       value: 0
  //     });
  //   }
    
  //   let timeMin = d3.min(current, ((d) => d.time)),
  //       timeMax = d3.max(current, ((d) => d.time));
    
  //   const x = d3.scaleTime()
  //     .domain([timeMin, timeMax])
  //     .range([0, width - 50]);

  //   const y = d3.scaleLinear()
  //     .domain([-100, 100])
  //     .range([height, 0]);

  //   const line = d3.line()
  //     .x((d) => x(d.time))
  //     .y((d) => y(d.value))
  //     // .curve(d3.curveBasis);

  //   let svg = d3.select(svgRef.current)      
  //     .attr('width', width)
  //     .attr('height', height);

  //   let x_axis = svg.append('g')
  //     .attr('class', 'x axis')
  //     .attr('transform', 'translate(20,' + y(0) + ')')
  //     .call(x.axis = d3.axisBottom().scale(x));

  //   svg.append('g')
  //     .attr('class', 'y axis')
  //     .attr('transform', 'translate(20,0)')
  //     .call(d3.axisLeft().scale(y).ticks(20));//.tickSize(-width + 50)

  //   let current_path = svg.append('g')
  //     .attr('transform', 'translate(20,0)')
  //     .append('path')
  //     .datum(current)
  //     .style('fill', 'transparent')
  //     .style('stroke', 'steelblue');

  //   tick(new Date(), 0);

  //   function tick(ts, v) {      

  //     // Shift domain
  //     x.domain([new Date(current[1].time), new Date(ts + 1000)]);
  //     // Slide x-axis left
  //     x_axis
  //       .transition()
  //       .duration(750)
  //       .ease(d3.easeLinear, 2)
  //       .call(x.axis);
  //     // Slide path left
  //     current_path
  //       // .transition()
  //       // .duration(750)
  //       // .ease(d3.easeLinear, 1)
  //       .attr('transform', 'translate(' + x(current[1].time) + ')');        
      
  //     current.push({
  //       value: v,
  //       time: new Date(ts)
  //     });      

  //     current_path.attr('d', line);
  //     // Remove oldest data point from each group
  //     current.shift();      
  //   }
    
  //   try {
  //     const ioClient = io.connect("http://localhost:5050");
  //     ioClient.on("data", msg => tick(msg.timestamp, msg.value));
  //   } catch (err) {
  //     console.log(err);
  //   }
  //   return () => io.close();
  // }, []);

  return (
    <div className="App">
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
}

export default App;
