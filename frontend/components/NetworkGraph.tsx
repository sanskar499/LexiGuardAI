import React, { useEffect, useRef, useState } from 'react';
import { Clause, CrossReference, Contradiction } from '../lib/api';
import { Network, RefreshCw, ZoomIn, ZoomOut, Eye, Layers } from 'lucide-react';

interface NetworkGraphProps {
  clauses: Clause[];
  crossRefs: CrossReference[];
  contradictions: Contradiction[];
  selectedSectionNumber: string | null;
  onSelectSection: (sectionNumber: string) => void;
}

interface GraphNode {
  id: string;
  label: string;
  category: string;
  hasConflict: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface GraphEdge {
  source: string;
  target: string;
  label: string;
  isConflict: boolean;
  type: string;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  clauses,
  crossRefs,
  contradictions,
  selectedSectionNumber,
  onSelectSection
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [zoom, setZoom] = useState(1);

  // Build nodes and edges
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || clauses.length === 0) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Conflict section lookup set
    const conflictSections = new Set<string>();
    contradictions.forEach((c) => {
      conflictSections.add(c.source_section);
      conflictSections.add(c.target_section);
    });

    // Create force-directed simulation nodes
    const nodeMap = new Map<string, GraphNode>();
    const totalNodes = clauses.length;
    const centerX = width / 2;
    const centerY = height / 2;
    const radiusCircle = Math.min(width, height) * 0.35;

    clauses.forEach((c, idx) => {
      const angle = (idx / totalNodes) * 2 * Math.PI;
      const x = centerX + radiusCircle * Math.cos(angle) + (Math.random() - 0.5) * 20;
      const y = centerY + radiusCircle * Math.sin(angle) + (Math.random() - 0.5) * 20;
      
      const secNum = c.section_number;
      const hasConflict = conflictSections.has(secNum) || c.has_contradiction;

      nodeMap.set(secNum, {
        id: secNum,
        label: secNum,
        category: c.category,
        hasConflict,
        x,
        y,
        vx: 0,
        vy: 0,
        radius: hasConflict ? 22 : 18
      });
    });

    // Build edges
    const edges: GraphEdge[] = [];

    // Explicit cross references
    crossRefs.forEach((xr) => {
      if (nodeMap.has(xr.source_section) && nodeMap.has(xr.target_section)) {
        const isConf = contradictions.some(
          (c) =>
            (c.source_section === xr.source_section && c.target_section === xr.target_section) ||
            (c.source_section === xr.target_section && c.target_section === xr.source_section)
        );
        edges.push({
          source: xr.source_section,
          target: xr.target_section,
          label: xr.ref_type,
          isConflict: isConf,
          type: xr.ref_type
        });
      }
    });

    // Contradiction red edges
    contradictions.forEach((c) => {
      const exists = edges.some(
        (e) =>
          (e.source === c.source_section && e.target === c.target_section) ||
          (e.source === c.target_section && e.target === c.source_section)
      );
      if (!exists && nodeMap.has(c.source_section) && nodeMap.has(c.target_section)) {
        edges.push({
          source: c.source_section,
          target: c.target_section,
          label: 'CONTRADICTION',
          isConflict: true,
          type: 'CONTRADICTION'
        });
      }
    });

    // Animation loop & simple force calculation
    let animId: number;
    let pulse = 0;

    const render = () => {
      pulse += 0.05;
      ctx.clearRect(0, 0, width, height);

      // Draw background grid
      ctx.strokeStyle = '#1E293B33';
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Edges
      edges.forEach((edge) => {
        const n1 = nodeMap.get(edge.source);
        const n2 = nodeMap.get(edge.target);
        if (!n1 || !n2) return;

        const isHighlighted =
          selectedSectionNumber === n1.id || selectedSectionNumber === n2.id;

        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);

        if (edge.isConflict) {
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = isHighlighted ? 3.5 : 2;
          ctx.setLineDash([6, 4]);
        } else {
          ctx.strokeStyle = isHighlighted ? '#06B6D4' : '#334155';
          ctx.lineWidth = isHighlighted ? 2.5 : 1.2;
          ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw Edge pulse dot if conflict
        if (edge.isConflict) {
          const t = (Math.sin(pulse) + 1) / 2;
          const px = n1.x + (n2.x - n1.x) * t;
          const py = n1.y + (n2.y - n1.y) * t;
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, 2 * Math.PI);
          ctx.fillStyle = '#F43F5E';
          ctx.fill();
        }
      });

      // Draw Nodes
      nodeMap.forEach((node) => {
        const isSelected = selectedSectionNumber === node.id;

        // Outer glow
        if (isSelected || node.hasConflict) {
          ctx.beginPath();
          const glowRadius = node.radius + (node.hasConflict ? Math.sin(pulse * 2) * 3 + 5 : 4);
          ctx.arc(node.x, node.y, glowRadius, 0, 2 * Math.PI);
          ctx.fillStyle = node.hasConflict ? 'rgba(239, 68, 68, 0.25)' : 'rgba(6, 182, 212, 0.25)';
          ctx.fill();
        }

        // Main Node Circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
        if (node.hasConflict) {
          ctx.fillStyle = isSelected ? '#DC2626' : '#991B1B';
          ctx.strokeStyle = '#F87171';
        } else {
          ctx.fillStyle = isSelected ? '#0284C7' : '#0F172A';
          ctx.strokeStyle = isSelected ? '#38BDF8' : '#334155';
        }
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();

        // Label text inside/above node
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const displayLabel = node.label.replace('Section ', 'S.');
        ctx.fillText(displayLabel, node.x, node.y);
      });

      animId = requestAnimationFrame(render);
    };

    render();

    // Mouse interactions
    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      nodeMap.forEach((node) => {
        const dist = Math.hypot(clickX - node.x, clickY - node.y);
        if (dist <= node.radius + 6) {
          onSelectSection(node.id);
        }
      });
    };

    canvas.addEventListener('click', handleCanvasClick);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, [clauses, crossRefs, contradictions, selectedSectionNumber]);

  return (
    <div
      ref={containerRef}
      className="h-full flex flex-col bg-slate-950/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl relative"
    >
      {/* Network Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <Network className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide">
            Cross-Reference Dependency Graph
          </h2>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-[11px]">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block"></span>
            <span className="text-slate-400">Valid Section</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block animate-pulse"></span>
            <span className="text-rose-400 font-medium">Contradiction</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-4 border-b-2 border-dashed border-rose-500 inline-block"></span>
            <span className="text-slate-400">Conflict Link</span>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative w-full h-full min-h-[350px]">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-pointer" />

        {/* Interactive Helper Overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-center space-x-2">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>Click any node to highlight linked clauses & risks</span>
        </div>
      </div>
    </div>
  );
};
