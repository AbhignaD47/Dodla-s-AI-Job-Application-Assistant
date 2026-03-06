import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Zap, FileText, Target, Award } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-20 lg:py-32 flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">

        {/* Decorative background elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10 animate-float" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-3xl -z-10" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-8 border border-primary/20 text-sm font-medium">
          <Zap size={16} className="text-primary" />
          <span>Dodla's AI Application Assistant is Live</span>
        </div>

        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mb-6 text-slate-900">
          Land Your Dream Job with <br className="hidden md:block" />
          <span className="text-gradient">Intelligent AI Automation</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          Upload your resume once. Let our AI find the perfect roles, score your ATS match,
          tailor your portfolio, and track your applications—all in one beautiful dashboard.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="rounded-full px-8 h-14 text-base font-semibold shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1">
              Start for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" size="lg" className="rounded-full px-8 h-14 text-base font-semibold bg-white/50 border-slate-200 hover:bg-slate-50 transition-all glass-card">
              View Pricing
            </Button>
          </Link>
        </div>
        <p className="text-sm text-muted-foreground mt-4 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-500" /> No credit card required. Get 1000 free credits.
        </p>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 bg-slate-50 border-y border-slate-200/50">
        <div className="container px-4 mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-slate-900">Everything you need to get hired faster</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">We've automated the most tedious parts of the job application process so you can focus on acing your interviews.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-2xl flex flex-col items-start bg-white z-10">
              <div className="bg-blue-100 p-3 rounded-xl text-blue-600 mb-6">
                <FileText size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Resume-First Matching</h3>
              <p className="text-muted-foreground leading-relaxed">
                Upload your resume, and our AI extracts your skills and experience to find jobs with a 70%+ relevance score.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl flex flex-col items-start bg-white z-10 relative">
              <div className="absolute -top-4 right-8 bg-gradient-to-r from-pink-500 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                Popular
              </div>
              <div className="bg-pink-100 p-3 rounded-xl text-pink-600 mb-6">
                <Target size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">JD-Specific Optimization</h3>
              <p className="text-muted-foreground leading-relaxed">
                Automatically rewrite your resume and generate dynamic portfolio pages tailored to each specific job description.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl flex flex-col items-start bg-white z-10">
              <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600 mb-6">
                <Award size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Kanban Tracker</h3>
              <p className="text-muted-foreground leading-relaxed">
                Manage your pipeline visually. Move applications from 'Saved' to 'Interview' to 'Offer' seamlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works simple text */}
      <section className="w-full py-20 container max-w-4xl mx-auto text-center px-4">
        <h2 className="text-3xl font-bold mb-8">Ready to revolutionize your job search?</h2>
        <div className="inline-block p-[2px] rounded-full bg-gradient-to-r from-primary via-pink-500 to-orange-500">
          <Link href="/signup">
            <Button size="lg" className="rounded-full px-10 h-16 text-lg font-bold bg-white text-slate-900 hover:bg-slate-50 border-0">
              Create your account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
