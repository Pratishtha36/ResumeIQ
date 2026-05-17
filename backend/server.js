import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env") });

const app = express();
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"] }));
app.use(express.json({ limit: "2mb" }));

const SYSTEM = `You are ResumeIQ, an expert ATS resume analyzer.
Respond ONLY with a raw JSON object — no markdown, no code fences, no extra text.

{
  "ats_score": <0-100>,
  "score_label": <"Poor"|"Fair"|"Good"|"Excellent">,
  "score_reason": <string>,
  "strengths": [<string>],
  "weaknesses": [<string>],
  "missing_skills": [<string>],
  "improvements": [<string>],
  "keyword_density": { "present": [<string>], "absent": [<string>] },
  "section_scores": { "contact":<0-10>, "summary":<0-10>, "experience":<0-10>, "skills":<0-10>, "education":<0-10>, "formatting":<0-10> },
  "recommendation": <"Strong Hire"|"Hire"|"Maybe"|"No Hire">,
  "recommendation_reason": <string>
}`;

app.post("/api/analyze", async (req, res) => {
  const { resumeText } = req.body;
  if (!resumeText?.trim()) {
    return res.status(400).json({ error: "resumeText is required" });
  }

  const key = process.env.GROQ_API_KEY;
  console.log("Using key:", key ? key.slice(0, 10) + "..." : "MISSING");

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.3,
        max_tokens: 1500,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user",   content: `Resume:\n${resumeText}` },
        ],
      }),
    });

    const data = await response.json();
    console.log("Groq status:", response.status);
    console.log("Groq response:", JSON.stringify(data).slice(0, 300));

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Groq API error" });
    }

    const raw = (data.choices?.[0]?.message?.content || "")
      .replace(/```json|```/g, "").trim();

    res.json(JSON.parse(raw));
  } catch (err) {
    console.error("Catch error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ ResumeIQ backend running on http://localhost:${PORT}`));