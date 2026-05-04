import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Topic, Subject, Mastery, masteryColor } from "@/lib/edugraph";

type Node = { id: string; x: number; y: number; vx: number; vy: number; topic: Topic };

interface Props {
  topics: Topic[];
  subjects: Subject[];
  mastery: Mastery[];
  onSelect: (t: Topic) => void;
  selectedId?: string;
}

export const KnowledgeGraph = ({ topics, subjects, mastery, onSelect, selectedId }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const [filterSubject, setFilterSubject] = useState<string | null>(null);
  const masteryMap = useMemo(() => new Map(mastery.map((m) => [m.topic_id, m.mastery])), [mastery]);
  const subjectMap = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects]);

  // Cluster nodes by subject in concentric arcs.
  const nodes = useMemo<Node[]>(() => {
    const bySubject = new Map<string, Topic[]>();
    topics.forEach((t) => {
      const arr = bySubject.get(t.subject_id) ?? [];
      arr.push(t);
      bySubject.set(t.subject_id, arr);
    });
    const subjectIds = [...bySubject.keys()];
    const cx = 500, cy = 350;
    const out: Node[] = [];
    subjectIds.forEach((sid, si) => {
      const angle0 = (si / subjectIds.length) * Math.PI * 2;
      const ring = 220 + (si % 2) * 80;
      const list = bySubject.get(sid)!;
      list.forEach((t, ti) => {
        const spread = (ti - (list.length - 1) / 2) * 0.18;
        const a = angle0 + spread;
        out.push({
          id: t.id,
          x: cx + Math.cos(a) * ring,
          y: cy + Math.sin(a) * ring,
          vx: 0, vy: 0,
          topic: t,
        });
      });
    });
    return out;
  }, [topics]);

  // Force-directed relax
  const positioned = useMemo(() => {
    const arr = nodes.map((n) => ({ ...n }));
    const idx = new Map(arr.map((n, i) => [n.id, i]));
    const links: [number, number][] = [];
    arr.forEach((n) => {
      n.topic.prerequisite_ids.forEach((p) => {
        const j = idx.get(p);
        if (j !== undefined) links.push([idx.get(n.id)!, j]);
      });
    });
    for (let iter = 0; iter < 80; iter++) {
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          const dx = arr[i].x - arr[j].x;
          const dy = arr[i].y - arr[j].y;
          const d2 = dx * dx + dy * dy + 0.1;
          const f = 800 / d2;
          arr[i].vx += dx * f; arr[i].vy += dy * f;
          arr[j].vx -= dx * f; arr[j].vy -= dy * f;
        }
      }
      links.forEach(([a, b]) => {
        const dx = arr[b].x - arr[a].x;
        const dy = arr[b].y - arr[a].y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = (d - 110) * 0.02;
        arr[a].vx += (dx / d) * f; arr[a].vy += (dy / d) * f;
        arr[b].vx -= (dx / d) * f; arr[b].vy -= (dy / d) * f;
      });
      arr.forEach((n) => {
        n.x += n.vx * 0.5; n.y += n.vy * 0.5;
        n.vx *= 0.6; n.vy *= 0.6;
      });
    }
    return { nodes: arr, links };
  }, [nodes]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current!;
    const wrap = wrapRef.current!;
    if (!canvas || !wrap) return;
    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth, h = wrap.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + "px"; canvas.style.height = h + "px";

    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    // Apply zoom and pan
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Fit graph
    const xs = positioned.nodes.map((n) => n.x);
    const ys = positioned.nodes.map((n) => n.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const pad = 60;
    const sx = (w - pad * 2) / (maxX - minX || 1);
    const sy = (h - pad * 2) / (maxY - minY || 1);
    const s = Math.min(sx, sy);
    const ox = pad - minX * s + (w - pad * 2 - (maxX - minX) * s) / 2;
    const oy = pad - minY * s + (h - pad * 2 - (maxY - minY) * s) / 2;
    const px = (n: Node) => ({ x: n.x * s + ox, y: n.y * s + oy });

    // Check if a node is related to hover/selected
    const isRelated = (nodeId: string) => {
      if (!hover && !selectedId) return false;
      const focusId = hover || selectedId;
      const focusNode = positioned.nodes.find(n => n.id === focusId);
      if (!focusNode) return false;
      return focusNode.topic.prerequisite_ids.includes(nodeId) ||
        positioned.nodes.find(n => n.id === nodeId)?.topic.prerequisite_ids.includes(focusId!) || false;
    };

    // Edges
    positioned.links.forEach(([a, b]) => {
      const nA = positioned.nodes[a], nB = positioned.nodes[b];
      const A = px(nA), B = px(nB);
      const isHi = hover === nA.id || hover === nB.id ||
                   selectedId === nA.id || selectedId === nB.id;
      const dimmed = (filterSubject && nA.topic.subject_id !== filterSubject && nB.topic.subject_id !== filterSubject);

      ctx.lineWidth = isHi ? 2 : 1;
      ctx.strokeStyle = dimmed ? "hsl(40 15% 25% / 0.06)" :
        isHi ? "hsl(15 65% 50% / 0.7)" : "hsl(40 15% 25% / 0.18)";
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2 - 18;
      ctx.quadraticCurveTo(mx, my, B.x, B.y);
      ctx.stroke();

      // Arrow
      if (isHi) {
        const angle = Math.atan2(B.y - my, B.x - mx);
        const arrowLen = 8;
        ctx.fillStyle = "hsl(15 65% 50% / 0.7)";
        ctx.beginPath();
        ctx.moveTo(B.x, B.y);
        ctx.lineTo(B.x - arrowLen * Math.cos(angle - 0.4), B.y - arrowLen * Math.sin(angle - 0.4));
        ctx.lineTo(B.x - arrowLen * Math.cos(angle + 0.4), B.y - arrowLen * Math.sin(angle + 0.4));
        ctx.fill();
      }
    });

    // Nodes
    positioned.nodes.forEach((n) => {
      const p = px(n);
      const m = masteryMap.get(n.id) ?? 0;
      const isHover = hover === n.id, isSel = selectedId === n.id;
      const related = isRelated(n.id);
      const dimmed = filterSubject && n.topic.subject_id !== filterSubject;
      const r = 14 + n.topic.difficulty * 1.6 + (isHover || isSel ? 4 : related ? 2 : 0);

      const alpha = dimmed ? 0.2 : 1;
      ctx.globalAlpha = alpha;

      // Glow for hovered/selected
      if (isHover || isSel) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, r + 12, 0, Math.PI * 2);
        ctx.fillStyle = `${masteryColor(m).replace(")", " / 0.15)")}`;
        ctx.fill();
      }

      // Halo
      ctx.beginPath();
      ctx.arc(p.x, p.y, r + 6, 0, Math.PI * 2);
      ctx.fillStyle = `${masteryColor(m).replace(")", " / 0.1)")}`;
      ctx.fill();

      // Body
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      const isDark = document.documentElement.classList.contains("dark");
      ctx.fillStyle = isDark ? "hsl(220 14% 16%)" : "hsl(40 30% 96%)";
      ctx.fill();
      ctx.lineWidth = isSel ? 3 : related ? 2 : 1.5;
      ctx.strokeStyle = isSel ? "hsl(15 65% 45%)" : related ? "hsl(15 65% 50% / 0.5)" : isDark ? "hsl(40 12% 40%)" : "hsl(40 15% 25%)";
      ctx.stroke();

      // Mastery arc
      if (m > 0) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * m) / 100);
        ctx.lineWidth = 3;
        ctx.strokeStyle = masteryColor(m);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    });

    // Labels
    const drawLabel = (n: Node, isFocus: boolean) => {
      const p = px(n);
      const dimmed = filterSubject && n.topic.subject_id !== filterSubject;
      if (dimmed && !isFocus) return;
      const r = 14 + n.topic.difficulty * 1.6 + (isFocus ? 4 : 0);
      ctx.font = isFocus ? "600 12px Inter, sans-serif" : "500 10px Inter, sans-serif";
      ctx.textAlign = "center";
      const textY = p.y + r + (isFocus ? 18 : 14);
      ctx.lineJoin = "round";
      ctx.lineWidth = isFocus ? 5 : 4;
      const isDark = document.documentElement.classList.contains("dark");
      ctx.strokeStyle = isDark ? "hsl(220 14% 12%)" : "hsl(40 30% 96%)";
      ctx.strokeText(n.topic.name, p.x, textY);
      ctx.fillStyle = isFocus
        ? (isDark ? "hsl(40 18% 88%)" : "hsl(40 15% 18%)")
        : (isDark ? "hsl(40 12% 55%)" : "hsl(40 15% 40%)");
      ctx.fillText(n.topic.name, p.x, textY);
    };

    positioned.nodes.forEach((n) => {
      if (hover !== n.id && selectedId !== n.id) drawLabel(n, false);
    });
    positioned.nodes.forEach((n) => {
      if (hover === n.id || selectedId === n.id) drawLabel(n, true);
    });

    ctx.restore();
    (canvas as any)._px = px;
    (canvas as any)._zoom = zoom;
    (canvas as any)._pan = pan;
  }, [positioned, masteryMap, hover, selectedId, zoom, pan, filterSubject]);

  useEffect(() => {
    draw();
    const onResize = () => draw();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;

    const onMove = (e: MouseEvent) => {
      if (isPanning) {
        setPan({
          x: panStart.current.panX + (e.clientX - panStart.current.x),
          y: panStart.current.panY + (e.clientY - panStart.current.y),
        });
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left - pan.x) / zoom;
      const my = (e.clientY - rect.top - pan.y) / zoom;
      const pxFn = (canvas as any)._px as (n: Node) => { x: number; y: number };
      if (!pxFn) return;
      let found: string | null = null;
      for (const n of positioned.nodes) {
        const p = pxFn(n);
        const r = 14 + n.topic.difficulty * 1.6 + 6;
        if ((p.x - mx) ** 2 + (p.y - my) ** 2 <= r * r) { found = n.id; break; }
      }
      if (found !== hover) setHover(found);
      canvas.style.cursor = found ? "pointer" : isPanning ? "grabbing" : "grab";
    };

    const onClick = (e: MouseEvent) => {
      if (isPanning) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left - pan.x) / zoom;
      const my = (e.clientY - rect.top - pan.y) / zoom;
      const pxFn = (canvas as any)._px as (n: Node) => { x: number; y: number };
      if (!pxFn) return;
      for (const n of positioned.nodes) {
        const p = pxFn(n);
        const r = 14 + n.topic.difficulty * 1.6 + 6;
        if ((p.x - mx) ** 2 + (p.y - my) ** 2 <= r * r) { onSelect(n.topic); return; }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(z => Math.max(0.3, Math.min(3, z * delta)));
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
        setIsPanning(true);
        panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
      }
    };

    const onMouseUp = () => setIsPanning(false);

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [positioned, hover, selectedId, onSelect, zoom, pan, isPanning]);

  const uniqueSubjects = [...new Set(topics.map(t => t.subject_id))];

  return (
    <div ref={wrapRef} className="relative w-full h-[640px] glass-card rounded-xl overflow-hidden">
      <canvas ref={canvasRef} className="cursor-grab" />

      {/* Controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <div className="text-[0.65rem] tracking-[0.3em] uppercase text-ink-soft mb-1">
          Knowledge Graph
        </div>
        {/* Subject filter */}
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setFilterSubject(null)}
            className={`text-[0.6rem] tracking-wider uppercase px-2 py-1 rounded border transition-all ${
              !filterSubject ? "border-terracotta bg-terracotta/10 text-terracotta" : "border-rule/40 text-ink-soft hover:border-ink/40"
            }`}
          >All</button>
          {uniqueSubjects.map(sid => {
            const sub = subjectMap.get(sid);
            return (
              <button
                key={sid}
                onClick={() => setFilterSubject(filterSubject === sid ? null : sid)}
                className={`text-[0.6rem] tracking-wider uppercase px-2 py-1 rounded border transition-all ${
                  filterSubject === sid ? "border-terracotta bg-terracotta/10 text-terracotta" : "border-rule/40 text-ink-soft hover:border-ink/40"
                }`}
              >{sub?.name ?? sid}</button>
            );
          })}
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-1">
        <button onClick={() => setZoom(z => Math.min(3, z * 1.2))} className="w-8 h-8 glass-card rounded-lg flex items-center justify-center text-ink hover:text-terracotta transition-colors text-sm font-bold">+</button>
        <button onClick={() => setZoom(z => Math.max(0.3, z * 0.8))} className="w-8 h-8 glass-card rounded-lg flex items-center justify-center text-ink hover:text-terracotta transition-colors text-sm font-bold">−</button>
        <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="w-8 h-8 glass-card rounded-lg flex items-center justify-center text-ink-soft hover:text-terracotta transition-colors text-[0.6rem]" title="Reset view">⟳</button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex items-center gap-4 text-[0.7rem] text-ink-soft">
        {[
          ["Strong", "hsl(150 35% 45%)"],
          ["Solid", "hsl(40 75% 55%)"],
          ["Weak", "hsl(20 70% 55%)"],
          ["Gap", "hsl(0 60% 55%)"],
        ].map(([l, c]) => (
          <span key={l} className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: c }} /> {l}
          </span>
        ))}
      </div>

      {/* Interaction hint */}
      <div className="absolute bottom-4 right-4 text-[0.6rem] text-ink-soft/50">
        Scroll to zoom · Shift+drag to pan · Click to inspect
      </div>

      {/* Hover tooltip */}
      {hover && (() => {
        const t = topics.find((x) => x.id === hover);
        const sub = t && subjectMap.get(t.subject_id);
        if (!t) return null;
        const m = masteryMap.get(t.id) ?? 0;
        return (
          <div className="absolute top-4 right-14 max-w-xs glass-card rounded-xl p-4">
            <p className="text-[0.6rem] tracking-[0.3em] uppercase text-terracotta">{sub?.name}</p>
            <p className="serif text-xl text-ink mt-1">{t.name}</p>
            <p className="text-xs text-ink-soft mt-2 leading-relaxed">{t.description}</p>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex-1 h-1.5 bg-rule/40 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${m}%`, background: masteryColor(m) }} />
              </div>
              <span className="text-xs font-medium" style={{ color: masteryColor(m) }}>{m}%</span>
            </div>
            <p className="text-[0.6rem] text-ink-soft/60 mt-2">
              Difficulty {t.difficulty}/5 · Click to inspect
            </p>
          </div>
        );
      })()}
    </div>
  );
};
