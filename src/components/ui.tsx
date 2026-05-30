"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";

/* ---------- Hero (приветствие на главной) ---------- */
export function Hero({ userName, subtitle }: { userName: string; subtitle?: React.ReactNode }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); }, []);
  const h = now ? now.getHours() : 12;
  const greet = !now ? "" : h < 5 ? "Доброй ночи" : h < 12 ? "Доброе утро" : h < 18 ? "Добрый день" : "Добрый вечер";
  const date = now ? now.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" }) : "";
  return (
    <div className="rise" style={{ paddingBottom: 4 }}>
      <p className="t-label" style={{ color: "var(--ink-mute)", marginBottom: 10, textTransform: "lowercase", minHeight: "1.3em" }} suppressHydrationWarning>{date}</p>
      <h1 className="t-hero" style={{ marginBottom: subtitle ? 14 : 0, minHeight: "2.2em" }} suppressHydrationWarning>
        {greet ? <>{greet},<br />{userName}</> : <>&nbsp;</>}
      </h1>
      {subtitle && <p className="t-body" style={{ color: "var(--ink-soft)", maxWidth: 460 }}>{subtitle}</p>}
    </div>
  );
}

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="rise" style={{ marginBottom: 24 }}>
      <h1 className="t-d1">{title}</h1>
      {subtitle && <p className="t-body" style={{ color: "var(--ink-soft)", marginTop: 6 }}>{subtitle}</p>}
    </div>
  );
}

/* ---------- Card ---------- */
export function Card({
  children, title, right, className = "", delay = 0, style, tappable, onClick, id,
}: {
  children: React.ReactNode; title?: string; right?: React.ReactNode;
  className?: string; delay?: number; style?: React.CSSProperties;
  tappable?: boolean; onClick?: () => void; id?: string;
}) {
  return (
    <div
      id={id}
      className={`card rise ${tappable ? "card--tappable" : ""} ${className}`}
      style={{ transitionDelay: delay ? `${delay}ms` : undefined, ...style }}
      onClick={onClick}
    >
      {title && <CardHead label={title} right={right} />}
      {children}
    </div>
  );
}

export function CardHead({
  label, icon, action, onAction, right,
}: { label: string; icon?: string; action?: string; onAction?: () => void; right?: React.ReactNode }) {
  return (
    <div className="row between center" style={{ marginBottom: 16 }}>
      <span className="section-label">{icon && <Icon name={icon} size={15} stroke={1.6} />}{label}</span>
      {right}
      {action && (
        <button className="link-action" onClick={onAction}>
          {action}<Icon name="chevron" size={14} stroke={2} />
        </button>
      )}
    </div>
  );
}

/* ---------- Checkbox ---------- */
export function Checkbox({ checked, onChange }: { checked: boolean; onChange?: (v: boolean) => void }) {
  return (
    <button
      className="check" data-on={checked ? "true" : "false"}
      aria-pressed={checked} aria-label="отметить"
      onClick={(e) => { e.stopPropagation(); onChange && onChange(!checked); }}
    >
      <Icon name="check" size={16} stroke={2.6} />
    </button>
  );
}

/* ---------- Badge ---------- */
export function Badge({
  variant = "neutral", icon, children,
}: { variant?: "neutral" | "accent" | "success" | "danger"; icon?: string; children: React.ReactNode }) {
  return (
    <span className={`badge badge--${variant}`}>
      {icon && <Icon name={icon} size={13} stroke={1.8} />}
      {children}
    </span>
  );
}

/* ---------- ProgressRing ---------- */
export function ProgressRing({
  value = 0, size = 96, stroke = 8, color = "var(--accent)", track = "var(--paper-sunk)", label, sublabel, icon, delay = 0,
}: {
  value?: number; size?: number; stroke?: number; color?: string; track?: string;
  label?: string; sublabel?: string; icon?: string; delay?: number;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setShown(Math.min(value, 1)), 60 + delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  const offset = circ * (1 - shown);
  return (
    <div style={{ position: "relative", width: size, height: size, display: "grid", placeItems: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          style={{ strokeDasharray: circ, strokeDashoffset: offset, transition: "stroke-dashoffset 1.1s var(--ease)" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
        {icon && <Icon name={icon} size={size > 90 ? 22 : 18} stroke={1.6} style={{ color: "var(--ink-soft)" }} />}
        {label != null && (
          <span className="num" style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: size > 90 ? 24 : 17, color: "var(--ink)", lineHeight: 1 }}>{label}</span>
        )}
        {sublabel && <span style={{ fontSize: 10, color: "var(--ink-mute)", fontWeight: 500, marginTop: 2 }}>{sublabel}</span>}
      </div>
    </div>
  );
}

/* ---------- сглаженный путь (Catmull-Rom → bezier) ---------- */
function smoothPath(pts: number[][]) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

type Pt = { l: string; v: number };

/* ---------- AreaChart (плавная область с заливкой) ---------- */
export function AreaChart({
  data, height = 150, color = "var(--accent)", goal,
}: { data: Pt[]; height?: number; color?: string; goal?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(320);
  useEffect(() => {
    const measure = () => ref.current && setW(ref.current.clientWidth);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  if (!data.length) return <div ref={ref} style={{ height, display: "grid", placeItems: "center", color: "var(--ink-mute)", fontSize: 13 }}>нет данных</div>;
  const padY = 16;
  const vals = data.map((d) => d.v);
  const min = Math.min(...vals), max = Math.max(...vals);
  const lo = min - (max - min) * 0.25 - 0.001, hi = max + (max - min) * 0.25 + 0.001;
  const n = data.length;
  const x = (i: number) => (n === 1 ? w / 2 : (i / (n - 1)) * (w - 8) + 4);
  const y = (v: number) => padY + (1 - (v - lo) / (hi - lo)) * (height - padY * 2);
  const pts = data.map((d, i) => [x(i), y(d.v)]);
  const line = smoothPath(pts);
  const area = `${line} L ${x(n - 1)},${height} L ${x(0)},${height} Z`;
  const gid = "ag" + Math.round(height) + n;
  return (
    <div ref={ref} style={{ width: "100%" }}>
      <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" style={{ display: "block", overflow: "visible" }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {goal != null && <line x1="0" y1={y(goal)} x2={w} y2={y(goal)} stroke="var(--line-strong)" strokeWidth="1" strokeDasharray="3 4" />}
        <path d={area} fill={`url(#${gid})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={i === n - 1 ? 4 : 0} fill="var(--paper-card)" stroke={color} strokeWidth="2.5" />
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        {data.map((d, i) => (
          <span key={i} style={{ fontSize: 11, color: i === n - 1 ? "var(--ink-soft)" : "var(--ink-mute)", fontWeight: i === n - 1 ? 600 : 500, flex: 1, textAlign: "center" }}>{d.l}</span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Bars ---------- */
export function Bars({
  data, height = 120, color = "var(--accent)", goal,
}: { data: (Pt & { accent?: boolean })[]; height?: number; color?: string; goal?: number }) {
  if (!data.length) return <div style={{ height, display: "grid", placeItems: "center", color: "var(--ink-mute)", fontSize: 13 }}>нет данных</div>;
  const max = Math.max(...data.map((d) => d.v), goal || 0) * 1.1 || 1;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
          <div style={{ width: "100%", flex: 1, display: "flex", alignItems: "flex-end" }}>
            <div style={{
              width: "100%", height: `${(d.v / max) * 100}%`,
              background: d.accent ? color : "var(--paper-sunk)",
              border: d.accent ? "none" : "1px solid var(--line)",
              borderRadius: 6, transition: `height 0.9s ${i * 60}ms var(--ease)`,
            }} />
          </div>
          <span style={{ fontSize: 11, color: "var(--ink-mute)", fontWeight: 500 }}>{d.l}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- Metric (число + подпись) ---------- */
export function Metric({ value, unit, label }: { value: string; unit?: string; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span className="section-label">{label}</span>
      <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
        <span className="num" style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 30, color: "var(--ink)", letterSpacing: "-0.01em" }}>{value}</span>
        {unit && <span style={{ fontSize: 14, color: "var(--ink-mute)", fontWeight: 500 }}>{unit}</span>}
      </div>
    </div>
  );
}

/* ---------- Placeholder (для экранов, где пока нет данных) ---------- */
export function Placeholder({ icon = "heart", title, hint }: { icon?: string; title: string; hint?: string }) {
  return (
    <div className="rise" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 14, padding: "72px 32px", minHeight: "50vh" }}>
      <div style={{ width: 64, height: 64, borderRadius: 18, background: "var(--paper-card)", border: "1px solid var(--line)", display: "grid", placeItems: "center", color: "var(--ink-mute)", boxShadow: "var(--shadow-sm)" }}>
        <Icon name={icon} size={28} stroke={1.6} />
      </div>
      <h2 className="t-d2" style={{ marginTop: 4 }}>{title}</h2>
      {hint && <p className="t-body" style={{ color: "var(--ink-soft)", maxWidth: 420 }}>{hint}</p>}
    </div>
  );
}
