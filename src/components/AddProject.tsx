import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileCode, Loader2, CheckCircle, AlertCircle, Sparkles, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import { cn } from '../lib/utils';
import { ProjectStatus, ProjectCategory } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface AnalysisResult {
  name: string;
  tagline: string;
  description: string;
  stack: string[];
  category: ProjectCategory;
}

export default function AddProject() {
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles].slice(0, 20)); // Limit to 20 files for analysis
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: files.length > 0,
    multiple: true
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const analyzeProject = async () => {
    if (files.length === 0) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      // Read file contents for analysis
      const fileContents = await Promise.all(
        files.map(async (file) => {
          const text = await file.text();
          return `File: ${file.name}\nContent Preview: ${text.slice(0, 1000)}`;
        })
      );

      const prompt = `
        Analyze the following project files and provide a structured summary.
        Files provided:
        ${fileContents.join('\n\n')}

        Based on these files, generate:
        1. A concise project name.
        2. A catchy one-sentence tagline.
        3. A brief 2-3 sentence description.
        4. A list of key technologies/frameworks used (stack).
        5. The most appropriate category: "Tool", "Library", or "App".

        Return the result in JSON format with the following keys:
        name, tagline, description, stack (array of strings), category (string: "Tool", "Library", or "App").
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              tagline: { type: Type.STRING },
              description: { type: Type.STRING },
              stack: { type: Type.ARRAY, items: { type: Type.STRING } },
              category: { type: Type.STRING, enum: ["Tool", "Library", "App"] },
            },
            required: ["name", "tagline", "description", "stack", "category"],
          },
        },
      });

      const result = JSON.parse(response.text || '{}') as AnalysisResult;
      setAnalysis(result);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError('Failed to analyze project. Please check your API key or try fewer files.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveProject = () => {
    // In a real app, we'd POST to /api/projects
    setIsSaved(true);
    setTimeout(() => {
      setFiles([]);
      setAnalysis(null);
      setIsSaved(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight mb-2">Add New Project</h1>
        <p className="text-muted text-sm font-mono">Upload your project files and let AI handle the metadata.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Dropzone & File List */}
        <div className="space-y-4">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[240px]",
              isDragActive ? "border-neon bg-neon/5" : "border-border-s hover:border-neon/50 bg-card",
              files.length > 0 && "cursor-default"
            )}
          >
            <input {...getInputProps()} />
            <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center mb-4">
              <Upload className={cn("w-6 h-6 transition-colors", isDragActive ? "text-neon" : "text-muted")} />
            </div>
            <h3 className="font-heading font-bold text-lg mb-1">
              {isDragActive ? "Drop files here" : "Drag & drop project folder"}
            </h3>
            <p className="text-muted text-xs font-mono max-w-[200px]">
              Or click to select files. We'll analyze package.json, source files, etc.
            </p>
          </div>

          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-card border border-border-s rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-border-s pb-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted">
                    Files to Analyze ({files.length})
                  </span>
                  <button
                    onClick={() => setFiles([])}
                    className="text-[10px] font-mono text-muted hover:text-red-500 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center justify-between group">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileCode className="w-3.5 h-3.5 text-muted flex-shrink-0" />
                        <span className="text-xs font-mono truncate text-ink/80">{file.name}</span>
                      </div>
                      <button
                        onClick={() => removeFile(i)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={analyzeProject}
                  disabled={isAnalyzing || files.length === 0}
                  className="w-full py-2.5 bg-ink text-neon font-heading font-semibold text-sm rounded-lg hover:bg-ink/90 transition-colors neon-glow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Analyze Project
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-xs font-mono">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>

        {/* Analysis Results */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {analysis ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card border border-border-s rounded-2xl p-6 space-y-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Sparkles className="w-24 h-24 text-neon" />
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-neon/10 text-neon rounded text-[10px] font-mono font-bold uppercase tracking-wider">
                      AI Analysis Complete
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1 block">Project Name</label>
                    <input
                      type="text"
                      value={analysis.name}
                      onChange={(e) => setAnalysis({ ...analysis, name: e.target.value })}
                      className="w-full bg-surface border border-border-s rounded-lg px-3 py-2 text-sm font-heading font-bold focus:outline-none focus:border-neon transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1 block">Tagline</label>
                    <input
                      type="text"
                      value={analysis.tagline}
                      onChange={(e) => setAnalysis({ ...analysis, tagline: e.target.value })}
                      className="w-full bg-surface border border-border-s rounded-lg px-3 py-2 text-xs text-muted focus:outline-none focus:border-neon transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1 block">Description</label>
                    <textarea
                      value={analysis.description}
                      onChange={(e) => setAnalysis({ ...analysis, description: e.target.value })}
                      rows={3}
                      className="w-full bg-surface border border-border-s rounded-lg px-3 py-2 text-xs leading-relaxed focus:outline-none focus:border-neon transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1 block">Tech Stack</label>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.stack.map((tech, i) => (
                        <span key={i} className="px-2 py-0.5 bg-surface border border-border-s rounded-md text-[10px] font-mono text-muted flex items-center gap-1">
                          {tech}
                          <button onClick={() => setAnalysis({ ...analysis, stack: analysis.stack.filter((_, j) => i !== j) })}>
                            <X className="w-2 h-2 hover:text-red-500" />
                          </button>
                        </span>
                      ))}
                      <button className="px-2 py-0.5 border border-dashed border-border-s rounded-md text-[10px] font-mono text-muted hover:border-neon hover:text-neon transition-colors">
                        + Add
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1 block">Category</label>
                      <select
                        value={analysis.category}
                        onChange={(e) => setAnalysis({ ...analysis, category: e.target.value as ProjectCategory })}
                        className="w-full bg-surface border border-border-s rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-neon transition-colors appearance-none"
                      >
                        <option value="Tool">Tool</option>
                        <option value="Library">Library</option>
                        <option value="App">App</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1 block">Initial Status</label>
                      <select
                        className="w-full bg-surface border border-border-s rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-neon transition-colors appearance-none"
                        defaultValue="In Progress"
                      >
                        <option value="Shipped">Shipped</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Experiment">Experiment</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={saveProject}
                    disabled={isSaved}
                    className={cn(
                      "w-full py-3 font-heading font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2",
                      isSaved ? "bg-green-500 text-white" : "bg-neon text-ink neon-glow hover:scale-[1.02] active:scale-[0.98]"
                    )}
                  >
                    {isSaved ? (
                      <>
                        <CheckCircle className="w-5 h-5" /> Project Saved
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" /> Add to Build Log
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border-s rounded-2xl bg-surface/50">
                <Sparkles className="w-12 h-12 text-border-s mb-4" />
                <h3 className="font-heading font-bold text-muted mb-2">Analysis Preview</h3>
                <p className="text-muted text-xs font-mono max-w-[240px]">
                  Upload files and click "Analyze Project" to see AI-generated metadata here.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
