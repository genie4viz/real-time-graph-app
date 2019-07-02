import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const LineChart = ({ value, timestamp }) => {
    const width = 600, height = 400;    
    const svgRef = useRef();
    useEffect(() => {
        let limit = 60 * 1,
            duration = 1000,
            now = timestamp - duration;

        let current = {
            value: value,
            data: d3.range(limit).map(() => 0)
        }

        let x = d3.scaleTime()
            .domain([now - (limit - 2), now - duration])
            .range([0, width])

        let y = d3.scaleLinear()
            .domain([-100, 100])
            .range([height, 0])

        let line = d3.line()            
            .x(function (d, i) {
                return x(now - (limit - 1 - i) * duration)
            })
            .y(function (d) {
                return y(d)
            })
            .curve(d3.curveBasis)

        let svg = d3.select(svgRef.current)
            .attr('class', 'chart')
            .attr('width', width)
            .attr('height', height + 50)

        let x_axis = svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + y(0) + ')')
            .call(x.axis = d3.axisBottom().scale(x))

        let y_axis = svg.append('g')
            .attr('class', 'y axis')
            .attr('transform', 'translate(20,0)')
            .call(d3.axisLeft().scale(y).ticks(20))

        let current_path = svg.append('g')
            .append('path')
            .data([current.data])
            .style('fill', 'transparent')
            .style('stroke', 'red')

        function tick() {
            now = new Date(timestamp);
            
            //group.data.push(group.value) // Real values arrive at irregular intervals
            current.data.push(value)
            current_path.attr('d', line)

            // Shift domain
            x.domain([now - (limit - 2) * duration, now - duration])

            // Slide x-axis left
            x_axis.transition()
                .duration(duration)
                .ease(d3.easeLinear, 2)
                .call(x.axis)     

            // Slide path left
            current_path.attr('transform', null)
                .transition()
                .duration(duration)
                .ease(d3.easeLinear, 2)
                .attr('transform', 'translate(' + x(now - (limit - 1) * duration) + ')')
                .on('end', tick)

            // Remove oldest data point from each group

            current.data.shift()

        }
        tick()

    });

    return <svg ref={svgRef} width={width} height={height} />
}
export default LineChart;