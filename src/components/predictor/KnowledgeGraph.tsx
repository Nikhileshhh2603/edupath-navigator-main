import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { SUBJECTS, Topic, SubjectKey } from "@/lib/curriculum-data";

interface KnowledgeGraphProps {
  subjectKey: SubjectKey;
  knownTopics: Set<string>;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  state: "mastered" | "critical" | "unlearned";
  radius: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: GraphNode;
  target: GraphNode;
}

function computeGraphNodes(subjectKey: SubjectKey, knownTopics: Set<string>): { nodes: GraphNode[]; links: GraphLink[] } {
  const curriculum = SUBJECTS[subjectKey];
  const topicsMap = new Map<string, Topic>(curriculum.topics.map((t) => [t.id, t]));

  // A topic is "critical" if it is NOT known AND is a prerequisite for at least 2 other un-mastered topics
  const blockingCount = new Map<string, number>();
  curriculum.topics.forEach((t) => {
    if (!knownTopics.has(t.id)) {
      t.prerequisites.forEach((prereqId) => {
        if (!knownTopics.has(prereqId)) {
          blockingCount.set(prereqId, (blockingCount.get(prereqId) ?? 0) + 1);
        }
      });
    }
  });

  const nodes: GraphNode[] = curriculum.topics.map((t) => {
    const known = knownTopics.has(t.id);
    const blocking = blockingCount.get(t.id) ?? 0;
    const state: GraphNode["state"] = known ? "mastered" : blocking >= 1 ? "critical" : "unlearned";
    return { id: t.id, label: t.label, state, radius: known ? 14 : blocking >= 1 ? 16 : 11 };
  });

  const nodesById = new Map<string, GraphNode>(nodes.map((n) => [n.id, n]));
  const links: GraphLink[] = [];
  curriculum.topics.forEach((t) => {
    t.prerequisites.forEach((prereqId) => {
      const src = nodesById.get(prereqId);
      const tgt = nodesById.get(t.id);
      if (src && tgt) links.push({ source: src, target: tgt });
    });
  });

  return { nodes, links };
}

const NODE_COLORS: Record<GraphNode["state"], string> = {
  mastered: "hsl(95, 18%, 38%)", // sage
  critical: "hsl(18, 42%, 46%)", // terracotta
  unlearned: "transparent",
};

export function KnowledgeGraph({ subjectKey, knownTopics }: KnowledgeGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const buildGraph = useCallback(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth || 900;
    const height = svgRef.current.clientHeight || 600;

    const { nodes, links } = computeGraphNodes(subjectKey, knownTopics);

    // Defs — glows
    const defs = svg.append("defs");
    (["mastered", "critical"] as const).forEach((state) => {
      const color = state === "mastered" ? "106, 128, 93" : "166, 85, 68"; // RGB approx for sage/terracotta
      const filter = defs.append("filter").attr("id", `glow-${state}`).attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
      filter.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "coloredBlur");
      const feMerge = filter.append("feMerge");
      feMerge.append("feMergeNode").attr("in", "coloredBlur");
      feMerge.append("feMergeNode").attr("in", "SourceGraphic");
    });

    // Arrow marker
    defs.append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 22)
      .attr("refY", 0)
      .attr("markerWidth", 5)
      .attr("markerHeight", 5)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "rgba(0,0,0,0.15)");

    const g = svg.append("g");

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.25, 3])
      .on("zoom", (event) => g.attr("transform", event.transform));
    svg.call(zoom);

    // Simulation
    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force("link", d3.forceLink<GraphNode, GraphLink>(links).id((d) => d.id).distance(160).strength(0.6))
      .force("charge", d3.forceManyBody().strength(-800))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius((d) => (d as GraphNode).radius + 40))
      .alphaDecay(0.025);

    // Links
    const link = g.append("g").attr("class", "links")
      .selectAll<SVGLineElement, GraphLink>("line")
      .data(links)
      .join("line")
      .attr("stroke", "rgba(0,0,0,0.15)")
      .attr("stroke-width", 1)
      .attr("marker-end", "url(#arrow)")
      .style("transition", "stroke 200ms ease, stroke-width 200ms ease, opacity 200ms ease");

    // Node groups
    const nodeG = g.append("g").attr("class", "nodes")
      .selectAll<SVGGElement, GraphNode>("g")
      .data(nodes)
      .join("g")
      .attr("cursor", "grab")
      .call(
        d3.drag<SVGGElement, GraphNode>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x; d.fy = d.y;
          })
          .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null; d.fy = null;
          }) as any
      );

    // Circle
    nodeG.append("circle")
      .attr("r", (d) => d.radius)
      .attr("fill", (d) => NODE_COLORS[d.state])
      .attr("stroke", (d) => d.state === "unlearned" ? "rgba(0,0,0,0.2)" : "transparent")
      .attr("stroke-width", 1)
      .attr("filter", (d) => d.state !== "unlearned" ? `url(#glow-${d.state})` : "")
      .style("transition", "transform 200ms ease, r 200ms ease, opacity 200ms ease, stroke 200ms ease");

    // Label
    nodeG.append("text")
      .attr("dy", (d) => d.radius + 13)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("fill", (d) => d.state === "unlearned" ? "rgba(0,0,0,0.4)" : "hsl(var(--ink))")
      .attr("font-family", "Inter, sans-serif")
      .attr("font-weight", (d) => d.state !== "unlearned" ? "500" : "400")
      .attr("pointer-events", "none")
      .text((d) => d.label);

    // Tooltip interaction
    nodeG
      .on("mouseenter", (event, d) => {
        const rect = svgRef.current!.getBoundingClientRect();
        setTooltip({ text: `${d.label} — ${d.state.toUpperCase()}`, x: event.clientX - rect.left, y: event.clientY - rect.top - 10 });
        setHoverId(d.id);
      })
      .on("mousemove", (event) => {
        const rect = svgRef.current!.getBoundingClientRect();
        setTooltip((prev) => prev ? { ...prev, x: event.clientX - rect.left, y: event.clientY - rect.top - 10 } : null);
      })
      .on("mouseleave", () => {
        setTooltip(null);
        setHoverId(null);
      });

    // Tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as GraphNode).x!)
        .attr("y1", (d) => (d.source as GraphNode).y!)
        .attr("x2", (d) => (d.target as GraphNode).x!)
        .attr("y2", (d) => (d.target as GraphNode).y!);
      nodeG.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    // Entrance animation: start nodes from center
    nodes.forEach((n) => { n.x = width / 2; n.y = height / 2; });
    simulation.alpha(1).restart();

    return () => simulation.stop();
  }, [subjectKey, knownTopics]);

  useEffect(() => {
    const cleanup = buildGraph();
    return cleanup;
  }, [buildGraph]);

  // Neighbor highlight (kept outside buildGraph to avoid rebuilding the simulation)
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const nodeSel = svg.selectAll<SVGGElement, GraphNode>("g.nodes > g");
    const linkSel = svg.selectAll<SVGLineElement, GraphLink>("g.links > line");

    if (!hoverId) {
      nodeSel.style("opacity", 1);
      nodeSel.select("circle").attr("r", (d) => d.radius);
      linkSel.style("opacity", 1).attr("stroke-width", 1).attr("stroke", "rgba(0,0,0,0.15)");
      return;
    }

    const neighbor = new Set<string>([hoverId]);
    linkSel.each((d) => {
      const s = (d.source as GraphNode).id;
      const t = (d.target as GraphNode).id;
      if (s === hoverId || t === hoverId) {
        neighbor.add(s);
        neighbor.add(t);
      }
    });

    nodeSel.style("opacity", (d) => (neighbor.has(d.id) ? 1 : 0.25));
    nodeSel.select("circle").attr("r", (d) => (d.id === hoverId ? d.radius + 4 : d.radius));
    linkSel
      .style("opacity", (d) => (((d.source as GraphNode).id === hoverId || (d.target as GraphNode).id === hoverId) ? 1 : 0.18))
      .attr("stroke-width", (d) => (((d.source as GraphNode).id === hoverId || (d.target as GraphNode).id === hoverId) ? 2 : 1))
      .attr("stroke", (d) => (((d.source as GraphNode).id === hoverId || (d.target as GraphNode).id === hoverId) ? "hsla(var(--terracotta), 0.55)" : "rgba(0,0,0,0.15)"));
  }, [hoverId]);

  // Rebuild on container resize
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => buildGraph());
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [buildGraph]);

  const stats = computeGraphNodes(subjectKey, knownTopics);
  const masteredCount = stats.nodes.filter((n) => n.state === "mastered").length;
  const criticalCount = stats.nodes.filter((n) => n.state === "critical").length;
  const unlearnedCount = stats.nodes.filter((n) => n.state === "unlearned").length;

  return (
    <div className="relative w-full h-full flex flex-col" ref={containerRef}>
      {/* Legend */}
      <div className="flex items-center gap-6 mb-2 px-1 flex-wrap">
        <LegendItem color="hsl(var(--sage))" glow="hsla(var(--sage), 0.4)" label={`Mastered (${masteredCount})`} />
        <LegendItem color="hsl(var(--terracotta))" glow="hsla(var(--terracotta), 0.5)" label={`Critical Gap (${criticalCount})`} />
        <LegendItem color="transparent" glow="transparent" label={`Not Learned (${unlearnedCount})`} dim />
        <span className="ml-auto text-[0.65rem] tracking-[0.2em] uppercase text-ink-soft/60">Scroll to zoom · Drag to pan</span>
      </div>

      <div className="relative flex-1 rounded-xl overflow-hidden bg-transparent">
        <svg ref={svgRef} className="w-full h-full" style={{ minHeight: 500 }} />
        {tooltip && (
          <div
            className="absolute pointer-events-none z-10 px-3 py-1.5 rounded-lg text-xs font-medium text-ink bg-paper border border-ink/20 shadow-xl"
            style={{ left: tooltip.x + 12, top: tooltip.y }}
          >
            {tooltip.text}
          </div>
        )}
      </div>
    </div>
  );
}

function LegendItem({ color, glow, label, dim }: { color: string; glow: string; label: string; dim?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-block w-3 h-3 rounded-full flex-shrink-0"
        style={{
          background: color,
          border: dim ? "1px solid rgba(0,0,0,0.2)" : `1px solid ${color}`,
          boxShadow: glow !== "transparent" ? `0 0 10px ${glow}` : "none",
        }}
      />
      <span className="text-xs text-ink-soft font-medium tracking-wide">{label}</span>
    </div>
  );
}
