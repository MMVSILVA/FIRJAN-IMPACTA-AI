import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Idea, UserProfile } from '../types';

interface ApprovedIdeasUnitChartProps {
  ideas: Idea[];
  users: UserProfile[];
}

export default function ApprovedIdeasUnitChart({ ideas, users }: ApprovedIdeasUnitChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 250 });
  const [tooltipData, setTooltipData] = useState<{ x: number; y: number; unit: string; count: number } | null>(null);

  // Resize handler for responsive width
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        setDimensions({
          width: Math.max(width, 280),
          height: 250
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    // Filter approved ideas
    const approvedIdeas = ideas.filter(
      (i) =>
        i.status === 'Aprovado' ||
        i.status === 'Em implementação' ||
        i.status === 'Finalizado' ||
        i.status === 'Em execução' ||
        i.status === 'Concluído'
    );

    // Default units to always show visual rhythm
    const defaultUnits = [
      'SENAI Maracanã',
      'SESI Duque de Caxias',
      'Sede Firjan Botafogo',
      'SENAI Jacarepaguá',
      'SESI/SENAI Nova Iguaçu'
    ];

    // Compute distribution counts
    const countsMap: { [key: string]: number } = {};
    defaultUnits.forEach((u) => {
      countsMap[u] = 0;
    });

    approvedIdeas.forEach((idea) => {
      const author = users.find((u) => u.id === idea.authorId);
      const unit = author?.unidade || 'Sede Firjan Botafogo';
      countsMap[unit] = (countsMap[unit] || 0) + 1;
    });

    // Format for D3
    const data = Object.keys(countsMap).map((unit) => ({
      unit,
      count: countsMap[unit]
    }));

    // Setup D3 margins
    const margin = { top: 20, right: 20, bottom: 65, left: 35 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // Clear previous elements
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create main grouping
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.unit))
      .range([0, width])
      .padding(0.4);

    // Y Scale (make sure we have at least 1 count range)
    const maxCount = d3.max(data, (d) => d.count) || 2;
    const y = d3
      .scaleLinear()
      .domain([0, maxCount + 1])
      .range([height, 0]);

    // Draw X Axis
    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-30)')
      .attr('fill', '#9ca3af')
      .style('font-size', '9px')
      .style('font-family', 'Inter, sans-serif');

    // Customize X Axis line
    g.selectAll('.domain').attr('stroke', '#3f3f46');
    g.selectAll('.tick line').attr('stroke', '#27272a');

    // Draw Y Axis (ticks with counts)
    g.append('g')
      .call(
        d3
          .axisLeft(y)
          .ticks(Math.min(maxCount + 1, 6))
          .tickFormat(d3.format('d'))
      )
      .selectAll('text')
      .attr('fill', '#9ca3af')
      .style('font-size', '9px')
      .style('font-family', 'JetBrains Mono, monospace');

    g.selectAll('.domain').attr('stroke', '#3f3f46');
    g.selectAll('.tick line').attr('stroke', '#27272a');

    // Add glowing filter definitions for bars
    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'neon-glow');
    filter
      .append('feGaussianBlur')
      .attr('stdDeviation', '2')
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Draw Bars with transition animations and dynamic event handling
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.unit) || 0)
      .attr('y', height) // starts at bottom for entrance transition
      .attr('width', x.bandwidth())
      .attr('height', 0)
      .attr('rx', 4) // border rounds
      .attr('fill', 'url(#barGradient)')
      .style('transition', 'fill 0.2s ease')
      .on('mouseover', function (event, d) {
        d3.select(this)
          .attr('fill', '#d8b4fe') // hover color
          .style('cursor', 'pointer')
          .attr('filter', 'url(#neon-glow)');

        // Convert page coordinates to local svg coordinates to display tooltip accurately
        const [mx, my] = d3.pointer(event, svgRef.current);
        setTooltipData({
          x: mx,
          y: my - 10,
          unit: d.unit,
          count: d.count
        });
      })
      .on('mousemove', function (event) {
        const [mx, my] = d3.pointer(event, svgRef.current);
        setTooltipData((prev) => (prev ? { ...prev, x: mx, y: my - 10 } : null));
      })
      .on('mouseout', function () {
        d3.select(this).attr('fill', 'url(#barGradient)').attr('filter', null);
        setTooltipData(null);
      })
      .transition()
      .duration(800)
      .delay((_d, i) => i * 100)
      .attr('y', (d) => y(d.count))
      .attr('height', (d) => height - y(d.count));

    // Linear gradient for bars to match purple digital palette
    const barGrad = defs
      .append('linearGradient')
      .attr('id', 'barGradient')
      .attr('x1', '0')
      .attr('y1', '0')
      .attr('x2', '0')
      .attr('y2', '1');
    barGrad.append('stop').attr('offset', '0%').attr('stop-color', '#a855f7');
    barGrad.append('stop').attr('offset', '100%').attr('stop-color', '#6366f1');

  }, [ideas, users, dimensions]);

  return (
    <div ref={containerRef} className="w-full relative h-[250px]">
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="overflow-visible" />
      {/* Floating Interactive Tooltip */}
      {tooltipData && (
        <div
          className="absolute z-20 pointer-events-none bg-zinc-950 border border-purple-500/30 rounded-lg p-2.5 text-[10.5px] shadow-2xl space-y-0.5 animate-in fade-in zoom-in-95 duration-100"
          style={{
            left: `${tooltipData.x}px`,
            top: `${tooltipData.y - 45}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <strong className="text-white block font-semibold leading-tight">{tooltipData.unit}</strong>
          <span className="text-zinc-400 block font-mono">
            Ideias Aprovadas: <strong className="text-purple-300 font-bold">{tooltipData.count}</strong>
          </span>
        </div>
      )}
    </div>
  );
}
