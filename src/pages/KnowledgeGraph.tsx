import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import api from '../services/api';
import { graphTheme as T } from '../utils/graphTheme';
import './KnowledgeGraph.css';

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  group: string;
  vtype?: string;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

const KnowledgeGraph: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[], links: GraphLink[] }>({ nodes: [], links: [] });
  const [zoomLevel, setZoomLevel] = useState(1);
  const zoomPct = Math.round(zoomLevel * 100);

  // References for D3 cleanup
  const simulationRef = useRef<d3.Simulation<GraphNode, undefined> | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<Element, unknown> | null>(null);

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/api/notes/graph');
        setGraphData(res.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || err.message || '获取图谱数据失败');
      } finally {
        setLoading(false);
      }
    };
    fetchGraphData();
  }, []);

  useEffect(() => {
    if (loading || !svgRef.current) return;
    const el = svgRef.current;
    if (graphData.nodes.length === 0) return;

    d3.select(el).selectAll('*').remove();
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    const nodes = graphData.nodes.map(d => ({ ...d }));
    const links = graphData.links.map(d => ({ ...d }));

    // Assign Visual Types
    const degreeMap: Record<string, number> = {};
    links.forEach(l => {
      const s = typeof l.source === 'object' ? l.source.id : (l.source as string);
      const t = typeof l.target === 'object' ? l.target.id : (l.target as string);
      degreeMap[s] = (degreeMap[s] || 0) + 1;
      degreeMap[t] = (degreeMap[t] || 0) + 1;
    });

    nodes.forEach(n => {
      if (n.group === 'note') n.vtype = 'note';
      else if (n.group === 'tag' && (degreeMap[n.id] || 0) >= 2) n.vtype = 'hubTag';
      else n.vtype = 'tag';
    });

    const W = el.clientWidth || 800;
    const H = el.clientHeight || 600;
    const radialRadius = Math.min(W, H) * 0.48;

    const svgSel = d3.select(el);

    // Defs for glow
    const defs = svgSel.append('defs');
    const glowFilter = defs.append('filter')
      .attr('id', 'node-outer-glow')
      .attr('x', '-80%').attr('y', '-80%').attr('width', '260%').attr('height', '260%');
    glowFilter.append('feGaussianBlur').attr('in', 'SourceGraphic').attr('stdDeviation', '4').attr('result', 'blur');
    glowFilter.append('feColorMatrix').attr('in', 'blur').attr('type', 'saturate').attr('values', '1.2').attr('result', 'glow');
    const merge = glowFilter.append('feMerge');
    merge.append('feMergeNode').attr('in', 'glow');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');

    const g = svgSel.append('g');

    // Force simulation
    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links).id(d => d.id).distance(100).strength(0.4))
      .force('charge', d3.forceManyBody().strength(-300).distanceMax(400))
      .force('center', d3.forceCenter(W / 2, H / 2).strength(0.05))
      .force('collide', d3.forceCollide<GraphNode>().radius(d => (T.radius as any)[d.vtype || d.group] + 10).strength(0.85))
      .force('x', d3.forceX(W / 2).strength(0.02))
      .force('y', d3.forceY(H / 2).strength(0.02))
      .force('radial', d3.forceRadial(radialRadius, W / 2, H / 2).strength(0.09))
      .alphaDecay(0.008).alphaMin(0.005).alphaTarget(0.008).velocityDecay(0.35);

    simulationRef.current = simulation;

    // Zoom
    const zoomBehavior = d3.zoom()
      .scaleExtent([0.1, 5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });
    svgSel.call(zoomBehavior as any);
    zoomBehaviorRef.current = zoomBehavior as any;

    // Links
    const linkSel = g.append('g').attr('class', 'link-layer')
      .selectAll('line').data(links).join('line')
      .attr('class', 'graph-link')
      .attr('stroke', T.edge.normal)
      .attr('stroke-width', 2.8);

    // Nodes
    const nodeColor = (d: GraphNode) => (T as any)[d.vtype || 'tag']?.fill || T.tag.fill;
    const nodeStroke = (d: GraphNode) => (T as any)[d.vtype || 'tag']?.stroke || 'none';
    const nodeRadius = (d: GraphNode) => (T.radius as any)[d.vtype || 'tag'] || T.radius.tag;

    const nodeGSel = g.append('g').attr('class', 'node-layer')
      .selectAll('g').data(nodes).join('g')
      .attr('class', d => `graph-node-g node-${d.vtype}`);

    nodeGSel.append('circle').attr('class', 'node-ring')
      .attr('r', d => nodeRadius(d) + 18).attr('fill', 'none').attr('stroke', nodeColor);
    
    nodeGSel.append('circle').attr('class', 'node-glow')
      .attr('r', d => nodeRadius(d) + 18).attr('fill', d => (T as any)[d.vtype || 'tag']?.glow || 'transparent');
    
    nodeGSel.append('circle').attr('class', 'node-body')
      .attr('r', nodeRadius).attr('fill', nodeColor)
      .attr('stroke', nodeStroke).attr('stroke-width', d => nodeStroke(d) !== 'none' ? 1.5 : 0)
      .attr('filter', 'url(#node-outer-glow)');

    nodeGSel.append('text').attr('class', 'node-label')
      .attr('dy', d => nodeRadius(d) + 16).attr('text-anchor', 'middle')
      .attr('font-size', d => ((T.label as any)[d.vtype || 'tag']?.fontSize || 12) + 'px')
      .attr('font-weight', d => (T.label as any)[d.vtype || 'tag']?.fontWeight || 500)
      .attr('fill', d => (T as any)[d.vtype || 'tag']?.label || T.tag.label)
      .text(d => d.name);

    // Drag behavior
    nodeGSel.call(d3.drag<SVGGElement, GraphNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.008);
        d.fx = null;
        d.fy = null;
      }) as any
    );

    simulation.on('tick', () => {
      linkSel
        .attr('x1', d => (d.source as GraphNode).x!)
        .attr('y1', d => (d.source as GraphNode).y!)
        .attr('x2', d => (d.target as GraphNode).x!)
        .attr('y2', d => (d.target as GraphNode).y!);
      nodeGSel.attr('transform', d => `translate(${d.x},${d.y})`);
    });

  }, [graphData, loading]);

  const zoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy as any, 1.3);
    }
  };

  const zoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy as any, 0.77);
    }
  };

  const resetView = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(400).call(zoomBehaviorRef.current.transform as any, d3.zoomIdentity);
    }
  };

  return (
    <div className="graph-root">
      {loading && (
        <div className="graph-overlay">
          <div className="spinner"></div>
        </div>
      )}
      {error && (
        <div className="graph-overlay">
          <div style={{ background: '#fee2e2', color: '#ef4444', padding: '8px 16px', borderRadius: '8px' }}>
            {error}
          </div>
        </div>
      )}
      {!loading && graphData.nodes.length === 0 && !error && (
        <div className="graph-overlay">
          <span className="empty-hint">暂无知识图谱数据。请先在个人中心或AI助手中添加随笔。</span>
        </div>
      )}

      <svg ref={svgRef} className="graph-canvas"></svg>

      <div className="legend-panel">
        <div className="legend-row"><span className="legend-dot" style={{ background: T.note.fill }}></span><span>随笔</span></div>
        <div className="legend-row"><span className="legend-dot" style={{ background: T.hubTag.fill }}></span><span>枢纽标签</span></div>
        <div className="legend-row"><span className="legend-dot" style={{ background: T.tag.fill }}></span><span>标签</span></div>
      </div>

      <div className="zoom-controls">
        <button onClick={zoomIn} className="zoom-btn" title="放大">＋</button>
        <span className="zoom-pct">{zoomPct}%</span>
        <button onClick={zoomOut} className="zoom-btn" title="缩小">−</button>
        <button onClick={resetView} className="zoom-btn" title="重置" style={{ borderLeft: '1px solid #e5e7eb', borderRadius: 0, paddingLeft: '8px', marginLeft: '4px' }}>⟲</button>
      </div>
    </div>
  );
};

export default KnowledgeGraph;
