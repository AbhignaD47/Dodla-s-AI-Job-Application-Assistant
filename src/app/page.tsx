import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, FileText, Target, Award, RocketIcon, Globe, Sparkles, Download, KanbanSquare } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center bg-slate-50 min-h-screen font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Hero Section */}
      <section className="w-full pt-32 pb-24 lg:pt-48 lg:pb-32 flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
        
        {/* Abstract Glowing Background Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-[100px] -z-10 mix-blend-multiply opacity-70 animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-emerald-400/10 to-teal-400/10 rounded-full blur-[100px] -z-10 mix-blend-multiply" />

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-slate-200/60 shadow-sm text-sm font-semibold mb-10 hover:bg-white transition-colors cursor-default">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600">
            Dodla's AI Next-Gen Assistant is Live
          </span>
        </div>

        <h1 className="text-6xl lg:text-8xl font-black tracking-tighter max-w-5xl mb-8 text-slate-900 leading-[1.1]">
          Engineer your hire. <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 pb-2 inline-block">
            Intelligent Automation.
          </span>
        </h1>

        <p className="text-xl lg:text-2xl text-slate-600 max-w-3xl mb-12 leading-relaxed font-medium">
          Upload your resume once. Our autonomous engine mathematically scores ATS alignment, 
          writes targeted cover letters, and builds dynamic custom portfolios—all in one place.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6 mt-4">
          <Link href="/dashboard">
            <Button size="lg" className="rounded-full px-10 h-16 text-lg font-bold bg-slate-900 text-white shadow-2xl hover:shadow-indigo-500/25 hover:bg-slate-800 transition-all hover:-translate-y-1">
              Enter Dashboard
              <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
          </Link>
        </div>

        <div className="mt-14 flex items-center justify-center gap-8 text-sm font-semibold text-slate-500">
          <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 100% Unlimited</span>
          <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Mathematical ATS Limits</span>
          <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Instant PDF Exports</span>
        </div>
      </section>

      {/* Bento Grid Feature Showcase */}
      <section className="w-full py-24 bg-white border-y border-slate-100 relative z-10">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">7 Core Artificial Capabilities</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
              We replaced manual typing with high-fidelity algorithms. From raw text extraction via mammoth to edge-function headless Chromium rendering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            
            {/* Feature 1 */}
            <Link href="/dashboard/score" className="group relative bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden flex flex-col justify-between block cursor-pointer">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-indigo-500/10 transition-colors" />
              <div>
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6 text-indigo-600">
                  <Target size={28} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">Mathematical ATS Scoring <span className="inline-block transition-transform group-hover:translate-x-1">→</span></h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  We don't hallucinate scores. We map exact skill intersections from standard JSON output and rigidly calculate required vs secondary arrays.
                </p>
              </div>
            </Link>

            {/* Feature 2 */}
            <Link href="/dashboard/resume" className="group relative bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 overflow-hidden flex flex-col justify-between block cursor-pointer">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-purple-500/10 transition-colors" />
              <div>
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6 text-purple-600">
                  <FileText size={28} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-purple-600 transition-colors">Resume Optimization <span className="inline-block transition-transform group-hover:translate-x-1">→</span></h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  Automatically rewrites your bullet points in real-time. Instantly copy the optimized plaintext to beat the specific JD filters.
                </p>
              </div>
            </Link>

            {/* Feature 3 */}
            <Link href="/dashboard" className="group relative bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-pink-200 hover:shadow-xl hover:shadow-pink-500/10 transition-all duration-300 overflow-hidden flex flex-col justify-between block cursor-pointer">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-pink-500/10 transition-colors" />
              <div>
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6 text-pink-600">
                  <Globe size={28} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-pink-600 transition-colors">JD-Specific Portfolio <span className="inline-block transition-transform group-hover:translate-x-1">→</span></h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  Generate an entire HTML portfolio tailored entirely around the JD requirements, omitting irrelevant skills perfectly.
                </p>
              </div>
            </Link>
            
            {/* Feature 4 */}
            <Link href="/dashboard" className="group relative bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 overflow-hidden flex flex-col justify-between block cursor-pointer">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-emerald-500/10 transition-colors" />
              <div>
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6 text-emerald-600">
                  <Download size={28} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">Serverless PDF Exports <span className="inline-block transition-transform group-hover:translate-x-1">→</span></h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  We integrated `puppeteer-core` natively on Vercel endpoints to seamlessly export dynamically generated portfolios to beautiful A4 PDFs.
                </p>
              </div>
            </Link>

            {/* Feature 5 & 6 (Merged for visual flow on grid) */}
            <Link href="/dashboard/applications" className="lg:col-span-2 group relative bg-indigo-900 rounded-3xl p-8 border border-indigo-800 hover:shadow-2xl hover:shadow-indigo-900/20 transition-all duration-300 overflow-hidden flex flex-col justify-between text-white block cursor-pointer">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10" />
              <div className="absolute bottom-0 right-0 p-8 opacity-20">
                <KanbanSquare size={120} strokeWidth={1} />
              </div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center mb-6 text-indigo-200">
                  <RocketIcon size={28} strokeWidth={2.5} />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-indigo-100 transition-colors">Kanban Tracking & Cover Letters <span className="inline-block transition-transform group-hover:translate-x-2">→</span></h3>
                <p className="text-indigo-200 leading-relaxed font-medium max-w-lg text-lg">
                  Visually manage state flow via drag-and-drop kanban boards, attach sticky persistent notes, and autonomously generate hyper-personalized cover letters and follow-up emails in one native workflow.
                </p>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* CTA Bottom Section */}
      <section className="w-full py-32 container max-w-5xl mx-auto text-center px-4 relative">
        <h2 className="text-5xl font-black mb-8 text-slate-900 tracking-tight">Bypass the boilerplate.</h2>
        <div className="inline-block p-1 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-2xl shadow-indigo-500/20 hover:scale-105 transition-transform duration-300">
          <Link href="/dashboard">
            <Button size="lg" className="rounded-full px-12 h-20 text-xl font-bold bg-white text-slate-900 hover:bg-slate-50 border-0">
              Launch App Architecture
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}
