import { useState, useRef, useEffect } from "react";

/* ── Google Fonts: JetBrains Mono + Syne ─────────────────────────────────── */
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Syne:wght@700;800;900&display=swap";
document.head.appendChild(fontLink);

/* ── Global CSS ───────────────────────────────────────────────────────────── */
const globalStyle = document.createElement("style");
globalStyle.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: #020408; }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #0a0f1a; }
  ::-webkit-scrollbar-thumb { background: #00ff9d33; border-radius: 99px; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes scanline {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(1);    opacity: .6; }
    100% { transform: scale(1.35); opacity: 0;  }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; } 50% { opacity: 0; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes countUp {
    from { opacity: 0; transform: scale(.8); }
    to   { opacity: 1; transform: scale(1);  }
  }

  .fade-up { animation: fadeUp .55s cubic-bezier(.4,0,.2,1) both; }
  .fade-up-1 { animation-delay: .05s; }
  .fade-up-2 { animation-delay: .12s; }
  .fade-up-3 { animation-delay: .20s; }

  .card-hover {
    transition: border-color .25s, box-shadow .25s, transform .2s;
  }
  .card-hover:hover {
    border-color: #00ff9d44 !important;
    box-shadow: 0 0 32px #00ff9d0a, 0 8px 40px rgba(0,0,0,.6) !important;
    transform: translateY(-2px);
  }

  .tab-btn {
    background: none; border: none; cursor: pointer;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
    text-transform: uppercase; padding: 10px 18px;
    transition: color .2s, border-color .2s;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    white-space: nowrap;
  }
  .tab-btn:hover { color: #00ff9d99 !important; }

  .analyze-btn {
    background: linear-gradient(135deg, #00ff9d, #00d4ff);
    border: none; border-radius: 8px; color: #020408;
    padding: 13px 28px; font-size: 13px; font-weight: 700;
    font-family: 'JetBrains Mono', monospace; letter-spacing: 1px;
    cursor: pointer; display: flex; align-items: center; gap: 10px;
    position: relative; overflow: hidden;
    transition: transform .15s, box-shadow .2s, opacity .2s;
    text-transform: uppercase;
  }
  .analyze-btn::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, #00ff9d, #00d4ff, #00ff9d);
    background-size: 200%;
    animation: shimmer 2s linear infinite;
    opacity: 0; transition: opacity .2s;
  }
  .analyze-btn:hover::before { opacity: 1; }
  .analyze-btn:hover { transform: translateY(-1px); box-shadow: 0 0 30px #00ff9d55; }
  .analyze-btn:disabled { opacity: .55; cursor: not-allowed; transform: none; box-shadow: none; }

  .upload-btn {
    width: 100%; background: transparent;
    border: 1px dashed #2a5a3a; border-radius: 10px;
    color: #6aaa80; padding: 14px 16px; font-size: 12px;
    font-family: 'JetBrains Mono', monospace; letter-spacing: .5px;
    cursor: pointer; display: flex; align-items: center;
    justify-content: center; gap: 8px; margin-bottom: 14px;
    transition: border-color .2s, color .2s, background .2s;
  }
  .upload-btn:hover {
    border-color: #00ff9d66; color: #00ff9d;
    background: #00ff9d08;
  }
  .upload-btn.active {
    border-color: #00ff9d; color: #00ff9d;
    background: #00ff9d0d;
  }

  .resume-textarea {
    width: 100%; background: #0d1f17;
    border: 1px solid #1a3d28; border-radius: 10px;
    padding: 14px 16px; color: #a8d4b8; font-size: 12px;
    font-family: 'JetBrains Mono', monospace; line-height: 1.7;
    resize: vertical; outline: none;
    transition: border-color .2s, box-shadow .2s;
  }
  .resume-textarea:focus {
    border-color: #00ff9d66;
    box-shadow: 0 0 0 3px #00ff9d14;
  }
  .resume-textarea::placeholder { color: #2e6644; }

  .pill {
    display: inline-block; border-radius: 99px;
    padding: 3px 12px; font-size: 11px; font-weight: 700;
    font-family: 'JetBrains Mono', monospace; letter-spacing: .5px;
    margin: 3px 3px 3px 0;
    transition: transform .15s;
  }
  .pill:hover { transform: scale(1.05); }

  .section-bar-fill {
    height: 100%; border-radius: 99px;
    transition: width 1.4s cubic-bezier(.4,0,.2,1);
  }

  .reset-btn {
    background: transparent; border: 1px solid #1e3a2f;
    border-radius: 8px; color: #4a7c59; padding: 13px 20px;
    font-size: 12px; font-family: 'JetBrains Mono', monospace;
    letter-spacing: 1px; text-transform: uppercase;
    cursor: pointer; transition: border-color .2s, color .2s, background .2s;
  }
  .reset-btn:hover { border-color: #f8717155; color: #f87171; background: #f8717108; }

  .grid-bg {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      linear-gradient(rgba(0,255,157,.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,255,157,.025) 1px, transparent 1px);
    background-size: 48px 48px;
  }
  .scanline {
    position: fixed; inset: 0; pointer-events: none; z-index: 1;
    overflow: hidden;
  }
  .scanline::after {
    content: ''; position: absolute; left: 0; right: 0; height: 120px;
    background: linear-gradient(transparent, rgba(0,255,157,.018), transparent);
    animation: scanline 8s linear infinite;
  }
`;
document.head.appendChild(globalStyle);

/* ── PDF.js CDN ───────────────────────────────────────────────────────────── */
const PDFJS_VERSION = "3.11.174";
const CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}`;
let _pdfjsPromise = null;
function loadPdfJs() {
  if (_pdfjsPromise) return _pdfjsPromise;
  _pdfjsPromise = new Promise((resolve, reject) => {
    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = `${CDN}/pdf.worker.min.js`;
      resolve(window.pdfjsLib); return;
    }
    const s = document.createElement("script");
    s.src = `${CDN}/pdf.min.js`;
    s.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = `${CDN}/pdf.worker.min.js`; resolve(window.pdfjsLib); };
    s.onerror = () => reject(new Error("pdf.js CDN failed"));
    document.head.appendChild(s);
  });
  return _pdfjsPromise;
}
async function extractPdfText(file) {
  const lib = await loadPdfJs();
  const pdf = await lib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  let text = "";
  for (let p = 1; p <= pdf.numPages; p++) {
    const pg = await pdf.getPage(p);
    const ct = await pg.getTextContent();
    text += ct.items.map(i => i.str).join(" ") + "\n";
  }
  return text.trim();
}

/* ── API ──────────────────────────────────────────────────────────────────── */
async function analyzeResume(text) {
  const res = await fetch("http://localhost:3001/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeText: text }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Server error");
  return data;
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function scoreColor(v, max = 100) {
  const pct = v / max;
  if (pct >= .8) return "#00ff9d";
  if (pct >= .6) return "#00d4ff";
  if (pct >= .4) return "#f59e0b";
  return "#f87171";
}

/* ── Sub-components ───────────────────────────────────────────────────────── */
function Spin() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
      style={{ animation: "spin .7s linear infinite", flexShrink: 0 }}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

function Label({ children }) {
  return (
    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: 3, color: "#3a9e68", textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ display: "inline-block", width: 18, height: 1, background: "#3a9e68" }} />
      {children}
    </div>
  );
}

function ScoreDial({ score }) {
  const r = 58, cx = 72, cy = 72, circ = 2 * Math.PI * r;
  const c = scoreColor(score);
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    let start = null;
    const duration = 1400;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setDisplayed(Math.round(p * score));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [score]);

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      {/* Pulse ring */}
      <div style={{ position: "absolute", width: 144, height: 144, borderRadius: "50%", border: `1px solid ${c}`, animation: "pulse-ring 2.5s ease-out infinite" }} />
      <svg width={144} height={144} viewBox="0 0 144 144">
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#0a1f14" strokeWidth={10} />
        {/* Glow layer */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={c} strokeWidth={10}
          strokeDasharray={`${(displayed / 100) * circ} ${circ}`}
          strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`}
          style={{ filter: `drop-shadow(0 0 6px ${c})`, transition: "none" }} />
        {/* Score number */}
        <text x={cx} y={cy - 6} textAnchor="middle" fill={c}
          style={{ fontSize: 32, fontWeight: 900, fontFamily: "'JetBrains Mono', monospace" }}>{displayed}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="#1e5c3a"
          style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 3 }}>ATS SCORE</text>
      </svg>
    </div>
  );
}

function SectionBar({ label, value }) {
  const c = scoreColor(value, 10);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#7abf96", textTransform: "capitalize", letterSpacing: .5 }}>{label}</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: c, fontWeight: 700 }}>{value}<span style={{ color: "#1e3a2f" }}>/10</span></span>
      </div>
      <div style={{ height: 3, borderRadius: 99, background: "#1a3d28", overflow: "hidden" }}>
        <div className="section-bar-fill" style={{ width: `${value * 10}%`, background: `linear-gradient(90deg, ${c}88, ${c})`, boxShadow: `0 0 8px ${c}66` }} />
      </div>
    </div>
  );
}

function BulletList({ items, color }) {
  if (!items?.length) return <p style={{ fontFamily: "'JetBrains Mono', monospace", color: "#1e3a2f", fontSize: 12 }}>// none detected</p>;
  return (
    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((it, i) => (
        <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ color, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, flexShrink: 0, marginTop: 1 }}>{">"}</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#9fd4b4", lineHeight: 1.7 }}>{it}</span>
        </li>
      ))}
    </ul>
  );
}

function RecBadge({ rec }) {
  const map = {
    "Strong Hire": { bg: "#00ff9d22", color: "#00ff9d", border: "#00ff9d44" },
    "Hire":        { bg: "#00d4ff22", color: "#00d4ff", border: "#00d4ff44" },
    "Maybe":       { bg: "#f59e0b22", color: "#f59e0b", border: "#f59e0b44" },
    "No Hire":     { bg: "#f8717122", color: "#f87171", border: "#f8717144" },
  };
  const s = map[rec] || { bg: "#ffffff11", color: "#fff", border: "#ffffff22" };
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: 6, padding: "6px 16px",
      fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700,
      letterSpacing: 1.5, textTransform: "uppercase",
      boxShadow: `0 0 16px ${s.color}22`,
    }}>{rec}</span>
  );
}

const TABS = ["overview", "details", "keywords", "improvements"];

/* ── Main App ─────────────────────────────────────────────────────────────── */
export default function App() {
  const [resume, setResume]     = useState("");
  const [jobDesc, setJobDesc]   = useState("");
  const [fileName, setFileName] = useState("");
  const [pdfBusy, setPdfBusy]   = useState(false);
  const [busy, setBusy]         = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState("");
  const [tab, setTab]           = useState("overview");
  const fileRef = useRef();

  useEffect(() => { loadPdfJs().catch(() => {}); }, []);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    setFileName(file.name);
    setError("");
    setPdfBusy(true);
    try {
      const text = await extractPdfText(file);
      if (!text) throw new Error("No text found. PDF may be image-based.");
      setResume(text);
    } catch (err) {
      setError(err.message);
      setFileName("");
    } finally {
      setPdfBusy(false);
    }
  };

  const analyze = async () => {
    if (!resume.trim()) { setError("// error: no resume input detected"); return; }
    setError(""); setBusy(true); setResult(null);
    try {
      const input = jobDesc.trim() ? `JOB DESCRIPTION:\n${jobDesc}\n\n---\n\nRESUME:\n${resume}` : resume;
      setResult(await analyzeResume(input));
      setTab("overview");
    } catch (err) {
      setError(`// error: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  const reset = () => { setResume(""); setJobDesc(""); setFileName(""); setResult(null); setError(""); };

  return (
    <div style={{ minHeight: "100vh", background: "#020408", color: "#8ab4a0", position: "relative" }}>

      {/* Background effects */}
      <div className="grid-bg" />
      <div className="scanline" />

      {/* Glow orbs */}
      <div style={{ position: "fixed", top: -200, left: -200, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, #00ff9d08 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: -200, right: -200, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, #00d4ff06 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 1400, margin: "0 auto", padding: "48px 32px 80px" }}>

        {/* ── Header ── */}
        <div className="fade-up" style={{ textAlign: "center", marginBottom: 56 }}>
          {/* Terminal prompt */}
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#3a9e68", letterSpacing: 2, marginBottom: 16 }}>
            <span style={{ color: "#00ff9d" }}>$</span> ./resumeiq --analyze --mode=pro
            <span style={{ animation: "blink 1s step-end infinite", color: "#00ff9d" }}>|</span>
          </div>

          <h1 style={{
            fontFamily: "'Syne', sans-serif", fontSize: "clamp(3rem, 8vw, 6rem)",
            fontWeight: 900, letterSpacing: -3, lineHeight: 1,
            background: "linear-gradient(135deg, #00ff9d 0%, #00d4ff 50%, #00ff9d 100%)",
            backgroundSize: "200%",
            animation: "shimmer 4s linear infinite",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: 16,
          }}>
            ResumeIQ
          </h1>

          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#4aae78", letterSpacing: 1 }}>
            ATS_SCORE &nbsp;/&nbsp; CAREER_INSIGHTS &nbsp;/&nbsp; AI_ANALYSIS
          </p>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 24 }}>
            <div style={{ height: 1, width: 80, background: "linear-gradient(90deg, transparent, #1e3a2f)" }} />
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ff9d", boxShadow: "0 0 8px #00ff9d" }} />
            <div style={{ height: 1, width: 80, background: "linear-gradient(90deg, #1e3a2f, transparent)" }} />
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1.5fr" : "minmax(0, 720px)", gap: 20, justifyContent: "center", alignItems: "start" }}>

          {/* ── INPUT PANEL ── */}
          <div className="fade-up fade-up-1 card-hover" style={{
            background: "linear-gradient(145deg, #0d1f17, #0a1a12)",
            border: "1px solid #1a3d28", borderRadius: 16,
            padding: 28, boxShadow: "0 8px 48px rgba(0,0,0,.6)",
          }}>

            {/* Panel header */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid #1a3d28" }}>
              <div style={{ display: "flex", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f87171" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#00ff9d" }} />
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#3a9e68", letterSpacing: 2, marginLeft: 8 }}>INPUT.tsx</span>
              <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: "#00ff9d", boxShadow: "0 0 6px #00ff9d", animation: "pulse-ring 2s ease-out infinite" }} />
            </div>

            <Label>Resume Input</Label>

            {/* Upload */}
            <button className={`upload-btn ${pdfBusy || fileName ? "active" : ""}`}
              onClick={() => fileRef.current.click()} disabled={pdfBusy}>
              {pdfBusy ? (
                <><Spin /> parsing pdf...</>
              ) : (
                <>
                  <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 9l5-5 5 5M12 4v12" />
                  </svg>
                  {fileName ? `// ${fileName}` : "upload_resume.pdf"}
                </>
              )}
            </button>
            <input ref={fileRef} type="file" accept=".pdf" onChange={handleFile} style={{ display: "none" }} />

            <textarea className="resume-textarea" style={{ height: 200 }}
              value={resume} onChange={e => setResume(e.target.value)}
              placeholder="// or paste raw resume text here..." />

            <div style={{ marginTop: 20 }}>
              <Label>Job Description <span style={{ color: "#0f2a1a" }}>// optional</span></Label>
              <textarea className="resume-textarea" style={{ height: 90 }}
                value={jobDesc} onChange={e => setJobDesc(e.target.value)}
                placeholder="// paste job posting for semantic keyword matching..." />
            </div>

            {error && (
              <div style={{
                marginTop: 14, padding: "10px 14px", borderRadius: 8,
                background: "#f8717114", border: "1px solid #f8717155",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#f87171",
                lineHeight: 1.5,
              }}>{error}</div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button className="analyze-btn" onClick={analyze} disabled={busy || pdfBusy}>
                <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                  {busy ? <><Spin /> analyzing...</> : <>
                    <svg width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                    run_analysis()
                  </>}
                </span>
              </button>
              {result && <button className="reset-btn" onClick={reset}>clear()</button>}
            </div>
          </div>

          {/* ── RESULTS PANEL ── */}
          {result && (
            <div className="fade-up fade-up-2 card-hover" style={{
              background: "linear-gradient(145deg, #0d1f17, #0a1a12)",
              border: "1px solid #1a3d28", borderRadius: 16,
              padding: 28, boxShadow: "0 8px 48px rgba(0,0,0,.6)",
            }}>

              {/* Panel header */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid #1a3d28" }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f87171" }} />
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#00ff9d" }} />
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#3a9e68", letterSpacing: 2, marginLeft: 8 }}>ANALYSIS.output</span>
              </div>

              {/* Score + recommendation */}
              <div style={{ display: "flex", alignItems: "center", gap: 28, marginBottom: 28, flexWrap: "wrap" }}>
                <ScoreDial score={result.ats_score} />
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#3a9e68", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>
                    -- hiring_signal
                  </div>
                  <RecBadge rec={result.recommendation} />
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#7abf96", marginTop: 12, lineHeight: 1.8 }}>
                    <span style={{ color: "#3a9e68" }}>// </span>{result.score_reason}
                  </p>
                </div>
              </div>

              {/* Tab bar */}
              <div style={{ display: "flex", borderBottom: "1px solid #1a3d28", marginBottom: 24, overflowX: "auto" }}>
                {TABS.map(t => (
                  <button key={t} className="tab-btn" onClick={() => setTab(t)} style={{
                    color: tab === t ? "#00ff9d" : "#1e5c3a",
                    borderBottomColor: tab === t ? "#00ff9d" : "transparent",
                    textShadow: tab === t ? "0 0 12px #00ff9d88" : "none",
                  }}>{t}</button>
                ))}
              </div>

              {/* Tab: overview */}
              {tab === "overview" && (
                <div style={{ animation: "fadeUp .3s ease both" }}>
                  <Label>Section Scores</Label>
                  <div style={{ marginBottom: 24 }}>
                    {Object.entries(result.section_scores || {}).map(([k, v]) => <SectionBar key={k} label={k} value={v} />)}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    <div>
                      <Label>Strengths</Label>
                      <BulletList items={result.strengths} color="#00ff9d" />
                    </div>
                    <div>
                      <Label>Weaknesses</Label>
                      <BulletList items={result.weaknesses} color="#f87171" />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: details */}
              {tab === "details" && (
                <div style={{ animation: "fadeUp .3s ease both" }}>
                  <Label>Missing Skills</Label>
                  <div style={{ marginBottom: 24 }}>
                    {result.missing_skills?.length
                      ? result.missing_skills.map((s, i) => (
                          <span key={i} className="pill" style={{ background: "#f59e0b18", color: "#f59e0b", border: "1px solid #f59e0b33" }}>{s}</span>
                        ))
                      : <p style={{ fontFamily: "'JetBrains Mono', monospace", color: "#4aae78", fontSize: 12 }}>// none detected</p>}
                  </div>
                  <Label>Final Recommendation</Label>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#9fd4b4", lineHeight: 1.9 }}>
                    <span style={{ color: "#3a9e68" }}>/** </span>
                    {result.recommendation_reason}
                    <span style={{ color: "#3a9e68" }}> */</span>
                  </p>
                </div>
              )}

              {/* Tab: keywords */}
              {tab === "keywords" && (
                <div style={{ animation: "fadeUp .3s ease both" }}>
                  <Label>Keywords Present</Label>
                  <div style={{ marginBottom: 22 }}>
                    {result.keyword_density?.present?.length
                      ? result.keyword_density.present.map((k, i) => (
                          <span key={i} className="pill" style={{ background: "#00ff9d18", color: "#00ff9d", border: "1px solid #00ff9d33" }}>{k}</span>
                        ))
                      : <p style={{ fontFamily: "'JetBrains Mono', monospace", color: "#4aae78", fontSize: 12 }}>// none found</p>}
                  </div>
                  <Label>Keywords Absent</Label>
                  <div>
                    {result.keyword_density?.absent?.length
                      ? result.keyword_density.absent.map((k, i) => (
                          <span key={i} className="pill" style={{ background: "#f8717118", color: "#f87171", border: "1px solid #f8717133" }}>{k}</span>
                        ))
                      : <p style={{ fontFamily: "'JetBrains Mono', monospace", color: "#4aae78", fontSize: 12 }}>// full coverage</p>}
                  </div>
                </div>
              )}

              {/* Tab: improvements */}
              {tab === "improvements" && (
                <div style={{ animation: "fadeUp .3s ease both" }}>
                  <Label>Improvement Suggestions</Label>
                  <BulletList items={result.improvements} color="#00d4ff" />
                </div>
              )}

            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="fade-up fade-up-3" style={{ textAlign: "center", marginTop: 60 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ height: 1, width: 60, background: "linear-gradient(90deg, transparent, #1a3d28)" }} />
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#3a9e68" }} />
            <div style={{ height: 1, width: 60, background: "linear-gradient(90deg, #1a3d28, transparent)" }} />
          </div>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#4aae78", letterSpacing: 1 }}>
            made with <span style={{ color: "#f87171" }}>&hearts;</span> by{" "}
            <span style={{ color: "#00ff9d", fontWeight: 700, textShadow: "0 0 12px #00ff9d66" }}>Pratishtha</span>
          </p>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#2a5a3a", letterSpacing: 2, marginTop: 6 }}>
            v2.0.0 -- powered by groq llama-3.3-70b
          </p>
        </div>

      </div>
    </div>
  );
}