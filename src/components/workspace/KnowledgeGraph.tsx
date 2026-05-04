import { useEffect, useMemo, useRef, useState } from "react";
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

  // Force-directed relax (a few iterations)
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
      // repulsion
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
      // spring along edges
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

  useEffect(() => {
    const canvas = canvasRef.current!;
    const wrap = wrapRef.current!;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const w = wrap.clientWidth, h = wrap.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      draw();
    };

    const draw = () => {
      const ctx = canvas.getContext("2d")!;
      const w = canvas.width, h = canvas.height;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.scale(dpr, dpr);

      // Fit graph
      const xs = positioned.nodes.map((n) => n.x);
      const ys = positioned.nodes.map((n) => n.y);
      const minX = Math.min(...xs), maxX = Math.max(...xs);
      const minY = Math.min(...ys), maxY = Math.max(...ys);
      const pad = 60;
      const cw = canvas.clientWidth, ch = canvas.clientHeight;
      const sx = (cw - pad * 2) / (maxX - minX || 1);
      const sy = (ch - pad * 2) / (maxY - minY || 1);
      const s = Math.min(sx, sy);
      const ox = pad - minX * s + (cw - pad * 2 - (maxX - minX) * s) / 2;
      const oy = pad - minY * s + (ch - pad * 2 - (maxY - minY) * s) / 2;
      const px = (n: Node) => ({ x: n.x * s + ox, y: n.y * s + oy });

      // Edges
      ctx.lineWidth = 1;
      positioned.links.forEach(([a, b]) => {
        const A = px(positioned.nodes[a]), B = px(positioned.nodes[b]);
        const isHi = hover === positioned.nodes[a].id || hover === positioned.nodes[b].id ||
                     selectedId === positioned.nodes[a].id || selectedId === positioned.nodes[b].id;
        ctx.strokeStyle = isHi ? "hsl(15 65% 50% / 0.7)" : "hsl(40 15% 25% / 0.18)";
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2 - 18;
        ctx.quadraticCurveTo(mx, my, B.x, B.y);
        ctx.stroke();
      });

      // Nodes (Bodies)
      positioned.nodes.forEach((n) => {
        const p = px(n);
        const m = masteryMap.get(n.id) ?? 0;
        const isHover = hover === n.id, isSel = selectedId === n.id;
        const r = 14 + n.topic.difficulty * 1.6 + (isHover || isSel ? 4 : 0);

        // halo
        ctx.beginPath();
        ctx.arc(p.x, p.y, r + 8, 0, Math.PI * 2);
        ctx.fillStyle = `${masteryColor(m).replace(")", " / 0.12)")}`;
        ctx.fill();

        // body
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = "hsl(40 30% 96%)";
        ctx.fill();
        ctx.lineWidth = isSel ? 3 : 1.5;
        ctx.strokeStyle = isSel ? "hsl(15 65% 45%)" : "hsl(40 15% 25%)";
        ctx.stroke();

        // mastery arc
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * m) / 100);
        ctx.lineWidth = 3;
        ctx.strokeStyle = masteryColor(m);
        ctx.stroke();
      });

      // Labels (drawn after nodes so they stay on top)
      const drawLabel = (n: Node, isFocus: boolean) => {
        const p = px(n);
        const r = 14 + n.topic.difficulty * 1.6 + (isFocus ? 4 : 0);
        ctx.font = isFocus ? "600 12px Inter, sans-serif" : "500 10px Inter, sans-serif";
        ctx.textAlign = "center";
        
        const textY = p.y + r + (isFocus ? 18 : 14);
        
        // Thick outline to cut through lines and other labels
        ctx.lineJoin = "round";
        ctx.lineWidth = isFocus ? 5 : 4;
        ctx.strokeStyle = "hsl(40 30% 96%)"; 
        ctx.strokeText(n.topic.name, p.x, textY);

        ctx.fillStyle = isFocus ? "hsl(40 15% 18%)" : "hsl(40 15% 40%)";
        ctx.fillText(n.topic.name, p.x, textY);
      };

      // Draw inactive labels first
      positioned.nodes.forEach((n) => {
        if (hover !== n.id && selectedId !== n.id) drawLabel(n, false);
      });
      
      // Draw active labels last (on top)
      positioned.nodes.forEach((n) => {
        if (hover === n.id || selectedId === n.id) drawLabel(n, true);
      });

      (canvas as any)._px = px;
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const px = (canvas as any)._px as (n: Node) => { x: number; y: number };
      let found: string | null = null;
      for (const n of positioned.nodes) {
        const p = px(n);
        const r = 14 + n.topic.difficulty * 1.6 + 6;
        if ((p.x - mx) ** 2 + (p.y - my) ** 2 <= r * r) { found = n.id; break; }
      }
      if (found !== hover) setHover(found);
      canvas.style.cursor = found ? "pointer" : "default";
    };
    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const px = (canvas as any)._px as (n: Node) => { x: number; y: number };
      for (const n of positioned.nodes) {
        const p = px(n);
        const r = 14 + n.topic.difficulty * 1.6 + 6;
        if ((p.x - mx) ** 2 + (p.y - my) ** 2 <= r * r) { onSelect(n.topic); return; }
      }
    };

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("click", onClick);
    };
  }, [positioned, masteryMap, hover, selectedId, onSelect]);

  return (
    <div ref={wrapRef} className="relative w-full h-[640px] border border-rule/60 bg-paper/60 overflow-hidden">
      <canvas ref={canvasRef} />
      <div className="absolute top-4 left-4 text-[0.65rem] tracking-[0.3em] uppercase text-ink-soft">
        Knowledge Graph · CS
      </div>
      <div className="absolute bottom-4 left-4 flex items-center gap-4 text-[0.7rem] text-ink-soft">
        {[
          ["Strong", "hsl(150 35% 45%)"],
          ["Solid", "hsl(40 75% 55%)"],
          ["Weak", "hsl(20 70% 55%)"],
          ["Gap", "hsl(0 60% 55%)"],
        ].map(([l, c]) => (
          <span key={l} className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: c }} /> {l}
          </span>
        ))}
      </div>
      {hover && (() => {
        const t = topics.find((x) => x.id === hover);
        const sub = t && subjectMap.get(t.subject_id);
        if (!t) return null;
        return (
          <div className="absolute top-4 right-4 max-w-xs bg-paper border border-rule/60 p-4 shadow-xl">
            <p className="text-[0.6rem] tracking-[0.3em] uppercase text-terracotta">{sub?.name}</p>
            <p className="serif text-xl text-ink mt-1">{t.name}</p>
            <p className="text-xs text-ink-soft mt-2">{t.description}</p>
            <p className="text-[0.65rem] text-ink-soft/70 mt-3">
              Mastery: <span className="text-ink">{masteryMap.get(t.id) ?? 0}%</span> · Difficulty {t.difficulty}/5
            </p>
          </div>
        );
      })()}
    </div>
  );
};
