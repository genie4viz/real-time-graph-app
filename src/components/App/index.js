import React, { useEffect, useState, useRef } from "react";
import io from 'socket.io-client';
import LineChart from '../LineChart';
import * as d3 from 'd3';

function App() {
  const width = 600, height = 400;
  const svgRef = useRef();

  useEffect(() => {    
    let limit = 30,
      now = new Date();

    let current = [];
    for(let i = 0; i < limit; i++){
      current.push({
        time: now - (limit - i + 1) * 1000,
        value: 0
      });
    }
    
    let timeMin = d3.min(current, ((d) => d.time)),
        timeMax = d3.max(current, ((d) => d.time));
    
    const x = d3.scaleTime()
      .domain([timeMin, timeMax])
      .range([0, width - 50]);

    const y = d3.scaleLinear()
      .domain([-100, 100])
      .range([height, 0]);

    const line = d3.line()
      .x((d) => x(d.time))
      .y((d) => y(d.value))
      // .curve(d3.curveBasis);

    let svg = d3.select(svgRef.current)      
      .attr('width', width)
      .attr('height', height);

    let x_axis = svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(20,' + y(0) + ')')
      .call(x.axis = d3.axisBottom().scale(x));

    svg.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(20,0)')
      .call(d3.axisLeft().scale(y).ticks(20));

    let current_path = svg.append('g')
      .attr('transform', 'translate(20,0)')
      .append('path')
      .datum(current)
      .style('fill', 'transparent')
      .style('stroke', 'steelblue');

    function tick(ts, v) {      

      // Shift domain
      x.domain([new Date(current[1].time), new Date(ts)]);
      // Slide x-axis left
      x_axis.call(x.axis);
      // Slide path left
      current_path.attr('transform', 'translate(' + x(current[1].time) + ')');
      
      current.push({
        value: v,
        time: new Date(ts)
      });      

      current_path.attr('d', line);
      

      
        
      // Remove oldest data point from each group
      current.shift();      
    }
    
    try {
      const ioClient = io.connect("http://localhost:5050");
      ioClient.on("data", msg => tick(msg.timestamp, msg.value));
    } catch (err) {
      console.log(err);
    }
    return () => io.close();
  }, []);

  return (
    <div className="App">
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
}

export default App;
