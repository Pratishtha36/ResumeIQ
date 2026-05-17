import { useState, useRef, useEffect } from "react";

const PDFJS_VERSION = "3.11.174";
const CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}`;
let _pdfjsPromise = null;

function loadPdfJs() {
  if (_pdfjsPromise) return _pdfjsPromise;
  _pdfjsPromise = new Promise((resolve, reject) => {
    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = `${CDN}/pdf.worker.min.js`;
      resolve(window.pdfjsLib);
      return;
    }
    const script = document.createElement("script");
    script.src = `${CDN}/pdf.min.js`;
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = `${CDN}/pdf.worker.min.js`;
      resolve(window.pdfjsLib);
    };
    script.onerror = () => reject(new Error("Could not load pdf.js from CDN."));
    document.head.appendChild(script);
  });
  return _pdfjsPromise;
}

async function extractPdfText(file) {
  const lib = await loadPdfJs();
  const buffer = await file.arrayBuffer();
  const pdf = await lib.getDocument({ data: new Uint8Array(buffer) }).promise;
  let text = "";
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    text += content.items.map((i) => i.str).join(" ") + "\n";
  }
  return text.trim();
}

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

function ScoreDial({ score, label }) {
  const r = 52, cx = 64, cy = 64, circ = 2 * Math.PI * r;
  const c = score >= 80 ? "#22d3a5" : score >= 60 ? "#facc15" : score >= 40 ? "#fb923c" : "#f87171";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <svg width={130} height={130} viewBox="0 0 128 128">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth={12} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={c} strokeWidth={12}
          strokeDasharray={`${(score / 100) * circ} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dasharray 1.4s cubic-bezier(.4,0,.2,1)" }} />
        <text x={cx} y={cy - 4} textAnchor="middle" fill={c}
          style={{ fontSize: 28, fontWeight: 800, fontFamily: "inherit" }}>{score}</text>
        <text x={cx} y={cy + 16} textAnchor="middle" fill="#475569"
          style={{ fontSize: 10, fontFamily: "inherit", letterSpacing: 2 }}>ATS SCORE</text>
      </svg>
      <span style={{
        background: c + "22", color: c, border: `1px solid ${c}55`,
        borderRadius: 99, padding: "4px 16px", fontSize: 11, fontWeight: 700, letterSpacing: 2
      }}>{label.toUpperCase()}</span>
    </div>
  );
}

function Bar({ label, value }) {
  const c = value >= 8 ? "#22d3a5" : value >= 5 ? "#facc15" : "#f87171";
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
        <span style={{ color: "#94a3b8", textTransform: "capitalize" }}>{label}</span>
        <span style={{ color: c, fontWeight: 700 }}>{value}/10</span>
      </div>
      <div style={{ height: 5, borderRadius: 99, background: "#1e293b" }}>
        <div style={{ height: "100%", borderRadius: 99, background: c, width: `${value * 10}%`, transition: "width 1.2s cubic-bezier(.4,0,.2,1)" }} />
      </div>
    </div>
  );
}

function Pill({ text, color }) {
  return (
    <span style={{
      background: color + "18", color, border: `1px solid ${color}44`,
      borderRadius: 99, padding: "3px 11px", fontSize: 12, fontWeight: 600,
      display: "inline-block", margin: "3px 3px 3px 0"
    }}>{text}</span>
  );
}

function BulletList({ items, bullet, color }) {
  if (!items?.length) return <p style={{ color: "#334155", fontSize: 13, margin: 0 }}>None identified.</p>;
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((it, i) => (
        <li key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "#cbd5e1", alignItems: "flex-start" }}>
          <span style={{ color, flexShrink: 0 }}>{bullet}</span><span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

function RecBadge({ rec }) {
  const m = { "Strong Hire": ["#22d3a5", "#022c22"], "Hire": ["#86efac", "#14532d"], "Maybe": ["#facc15", "#713f12"], "No Hire": ["#f87171", "#450a0a"] };
  const [bg, fg] = m[rec] || ["#64748b", "#fff"];
  return <span style={{ background: bg, color: fg, borderRadius: 8, padding: "6px 20px", fontSize: 14, fontWeight: 800 }}>{rec}</span>;
}

function Spin() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
      style={{ animation: "spin .75s linear infinite", flexShrink: 0 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

const SectionTitle = ({ children }) => (
  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, color: "#475569", textTransform: "uppercase", marginBottom: 12 }}>{children}</div>
);

const TABS = ["overview", "details", "keywords", "improvements"];

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
      if (!text) throw new Error("No text found. PDF may be image-based — paste text instead.");
      setResume(text);
    } catch (err) {
      setError(err.message);
      setFileName("");
    } finally {
      setPdfBusy(false);
    }
  };

  const analyze = async () => {
    if (!resume.trim()) { setError("Upload a PDF or paste your resume text first."); return; }
    setError(""); setBusy(true); setResult(null);
    try {
      const input = jobDesc.trim() ? `JOB DESCRIPTION:\n${jobDesc}\n\n---\n\nRESUME:\n${resume}` : resume;
      setResult(await analyzeResume(input));
      setTab("overview");
    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  const reset = () => { setResume(""); setJobDesc(""); setFileName(""); setResult(null); setError(""); };

  const card     = { background: "rgba(15,23,42,.92)", border: "1px solid #1e293b", borderRadius: 20, padding: 28, boxShadow: "0 8px 40px rgba(0,0,0,.5)" };
  const lbl      = { fontSize: 10, fontWeight: 700, letterSpacing: 2.5, color: "#475569", textTransform: "uppercase", display: "block", marginBottom: 8 };
  const textarea = { width: "100%", background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "12px 14px", color: "#e2e8f0", fontSize: 13, resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box", lineHeight: 1.6 };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#020617 0%,#0f172a 60%,#020617 100%)", color: "#e2e8f0", fontFamily: "'DM Sans','Segoe UI',sans-serif", padding: "36px 16px 80px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <h1 style={{ fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 900, letterSpacing: -1, margin: 0, background: "linear-gradient(90deg,#38bdf8,#22d3a5,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            ResumeIQ
          </h1>
          <p style={{ color: "#475569", marginTop: 8, fontSize: 15 }}>ATS Scoring · Career Insights</p>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1.4fr" : "minmax(0,560px)", gap: 20, justifyContent: "center" }}>

          {/* INPUT CARD */}
          <div style={card}>
            <span style={lbl}>Resume</span>

            <button onClick={() => fileRef.current.click()} disabled={pdfBusy} style={{
              background: "#0f172a", border: `1px dashed ${pdfBusy ? "#22d3a5" : "#334155"}`,
              borderRadius: 12, color: pdfBusy ? "#22d3a5" : "#64748b",
              padding: "10px 16px", fontSize: 13, cursor: pdfBusy ? "wait" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 8, marginBottom: 12, fontFamily: "inherit", width: "100%",
            }}>
              {pdfBusy
                ? <><Spin /> Reading PDF...</>
                : <><svg width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 9l5-5 5 5M12 4v12" /></svg>{fileName || "Upload PDF Resume"}</>}
            </button>
            <input ref={fileRef} type="file" accept=".pdf" onChange={handleFile} style={{ display: "none" }} />

            <textarea style={{ ...textarea, height: 200 }} value={resume}
              onChange={(e) => setResume(e.target.value)} placeholder="...or paste resume text here" />

            <span style={{ ...lbl, marginTop: 18 }}>
              Job Description <span style={{ color: "#334155", textTransform: "none", letterSpacing: 0, fontWeight: 400 }}>(optional)</span>
            </span>
            <textarea style={{ ...textarea, height: 80 }} value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)} placeholder="Paste job posting for targeted keyword matching..." />

            {error && (
              <div style={{ background: "#450a0a22", border: "1px solid #7f1d1d", borderRadius: 10, padding: "10px 14px", color: "#fca5a5", fontSize: 13, marginTop: 12, lineHeight: 1.5 }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={analyze} disabled={busy || pdfBusy} style={{
                background: "linear-gradient(135deg,#3b82f6,#6366f1)", border: "none",
                borderRadius: 12, color: "#fff", padding: "12px 24px",
                fontSize: 14, fontWeight: 700, cursor: busy ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 8,
                opacity: busy ? 0.7 : 1, fontFamily: "inherit",
              }}>
                {busy ? <><Spin /> Analyzing...</> : <>Analyze Resume</>}
              </button>
              {result && (
                <button onClick={reset} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12, color: "#94a3b8", padding: "12px 20px", fontSize: 14, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Reset</button>
              )}
            </div>
          </div>

          {/* RESULTS CARD */}
          {result && (
            <div style={card}>
              <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 28, flexWrap: "wrap" }}>
                <ScoreDial score={result.ats_score} label={result.score_label} />
                <div style={{ flex: 1, minWidth: 160 }}>
                  <SectionTitle>Hiring Signal</SectionTitle>
                  <RecBadge rec={result.recommendation} />
                  <p style={{ fontSize: 13, color: "#64748b", marginTop: 10, lineHeight: 1.6 }}>{result.score_reason}</p>
                </div>
              </div>

              <div style={{ display: "flex", borderBottom: "1px solid #1e293b", marginBottom: 22 }}>
                {TABS.map((t) => (
                  <button key={t} onClick={() => setTab(t)} style={{
                    background: "none", border: "none",
                    borderBottom: `2px solid ${tab === t ? "#38bdf8" : "transparent"}`,
                    color: tab === t ? "#38bdf8" : "#475569",
                    padding: "8px 16px", fontSize: 12, fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize",
                    letterSpacing: 0.5, marginBottom: -1, transition: "color .15s",
                  }}>{t}</button>
                ))}
              </div>

              {tab === "overview" && (
                <>
                  <div style={{ marginBottom: 24 }}>
                    <SectionTitle>Section Scores</SectionTitle>
                    {Object.entries(result.section_scores || {}).map(([k, v]) => <Bar key={k} label={k} value={v} />)}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    <div><SectionTitle>Strengths</SectionTitle><BulletList items={result.strengths} bullet="+" color="#22d3a5" /></div>
                    <div><SectionTitle>Weaknesses</SectionTitle><BulletList items={result.weaknesses} bullet="-" color="#f87171" /></div>
                  </div>
                </>
              )}

              {tab === "details" && (
                <>
                  <div style={{ marginBottom: 24 }}>
                    <SectionTitle>Missing Skills</SectionTitle>
                    {result.missing_skills?.length
                      ? result.missing_skills.map((s, i) => <Pill key={i} text={s} color="#fb923c" />)
                      : <p style={{ color: "#334155", fontSize: 13 }}>None - great coverage!</p>}
                  </div>
                  <div>
                    <SectionTitle>Recommendation</SectionTitle>
                    <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7 }}>{result.recommendation_reason}</p>
                  </div>
                </>
              )}

              {tab === "keywords" && (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <SectionTitle>Keywords Present</SectionTitle>
                    {result.keyword_density?.present?.length
                      ? result.keyword_density.present.map((k, i) => <Pill key={i} text={k} color="#22d3a5" />)
                      : <p style={{ color: "#334155", fontSize: 13 }}>None found.</p>}
                  </div>
                  <div>
                    <SectionTitle>Keywords Absent</SectionTitle>
                    {result.keyword_density?.absent?.length
                      ? result.keyword_density.absent.map((k, i) => <Pill key={i} text={k} color="#f87171" />)
                      : <p style={{ color: "#334155", fontSize: 13 }}>Looks comprehensive!</p>}
                  </div>
                </>
              )}

              {tab === "improvements" && (
                <div>
                  <SectionTitle>Improvement Suggestions</SectionTitle>
                  <BulletList items={result.improvements} bullet=">" color="#818cf8" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", marginTop: 56, fontSize: 14, color: "#475569", letterSpacing: 0.5 }}>
          Made with <span style={{ color: "#f87171" }}>&hearts;</span> by{" "}
          <span style={{ color: "#22d3a5", fontWeight: 700 }}>Pratishtha</span>
        </p>

      </div>
    </div>
  );
}