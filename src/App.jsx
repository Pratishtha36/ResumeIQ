import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles, Upload } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

// PDF Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

function App() {
  const [resume, setResume] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  // PDF Upload Handler
  const handlePDFUpload = async (e) => {
    try {
      const file = e.target.files[0];

      if (!file) return;

      setFileName(file.name);

      const fileReader = new FileReader();

      fileReader.onload = async function () {
        const typedArray = new Uint8Array(this.result);

        // Load PDF
        const pdf = await pdfjsLib.getDocument({
          data: typedArray,
        }).promise;

        let extractedText = "";

        // Read all pages
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);

          const textContent = await page.getTextContent();

          const textItems = textContent.items
            .map((item) => item.str)
            .join(" ");

          extractedText += textItems + "\n";
        }

        setResume(extractedText);

        console.log("PDF Extracted Successfully");
      };

      fileReader.readAsArrayBuffer(file);
    } catch (error) {
      console.log(error);
      alert("Failed to read PDF");
    }
  };

  // AI Analysis
  const analyzeResume = async () => {
    if (!resume.trim()) {
      alert("Please paste or upload a resume.");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `
You are a professional ATS Resume Analyzer.

Analyze this resume and provide:

# ATS Score (out of 100)

# Strengths

# Weaknesses

# Missing Skills

# Improvement Suggestions

# Final Hiring Recommendation

Resume:
${resume}
                    `,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();

      console.log(data);

      if (!response.ok) {
        throw new Error(
          data.error?.message || "Failed to analyze resume."
        );
      }

      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text;

      setResult(text || "No analysis generated.");
    } catch (error) {
      console.log(error);
      setResult(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold mb-4">
            ResumeIQ
          </h1>

          <p className="text-slate-400 text-lg">
            AI Powered Resume Analyzer
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* LEFT SECTION */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">

            <h2 className="text-2xl font-semibold mb-4">
              Upload or Paste Resume
            </h2>

            {/* Upload Button */}
            <label className="bg-slate-800 hover:bg-slate-700 transition px-4 py-3 rounded-xl cursor-pointer inline-flex items-center gap-2 mb-4">

              <Upload size={18} />

              {fileName ? fileName : "Choose PDF Resume"}

              <input
                type="file"
                accept=".pdf"
                onChange={handlePDFUpload}
                className="hidden"
              />
            </label>

            {/* Textarea */}
            <textarea
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="Paste your resume here..."
              className="w-full h-96 bg-slate-800 rounded-xl p-4 outline-none resize-none"
            />

            {/* Analyze Button */}
            <button
              onClick={analyzeResume}
              disabled={loading}
              className="mt-4 bg-blue-600 hover:bg-blue-700 hover:scale-105 duration-200 transition px-6 py-3 rounded-xl flex items-center gap-2"
            >
              <Sparkles size={18} />

              {loading ? "Analyzing..." : "Analyze Resume"}
            </button>

          </div>

          {/* RIGHT SECTION */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl overflow-auto">

            <h2 className="text-2xl font-semibold mb-4">
              Analysis Result
            </h2>

            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>
                {result || "AI analysis will appear here..."}
              </ReactMarkdown>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default App;