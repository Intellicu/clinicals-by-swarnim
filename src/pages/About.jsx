import React from "react";
import { Link } from "react-router-dom";
import { Dna, Users, BookOpen, FlaskConical, Mail } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Hero */}
        <div className="bg-gradient-to-br from-violet-700 to-indigo-800 rounded-2xl p-8 text-white mb-8 shadow-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Dna className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">About CliniCals Hub</h1>
              <p className="text-violet-200 text-sm mt-0.5">by Swarnim</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-violet-600" /> What is CliniCals Hub?
            </h2>
            <p className="text-slate-600 leading-relaxed">
              CliniCals Hub is a comprehensive pediatric clinical intelligence platform designed to support
              healthcare professionals in delivering evidence-based care. The platform brings together
              clinical decision support tools, drug dosing calculators, rare disease screening modules,
              nephrology and urology pathways, AI-assisted diagnosis aids, research workflow management,
              and structured patient management — all in one integrated environment optimised for busy
              clinical settings. Whether you are managing a complex case of aHUS in a neonatal ICU,
              screening a child for Fabry disease in an outpatient clinic, or drafting a research manuscript,
              CliniCals Hub is built to support every step of the clinical and academic workflow.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" /> Who is it for?
            </h2>
            <p className="text-slate-600 leading-relaxed">
              CliniCals Hub is built primarily for <strong>pediatric nephrologists, residents, and fellows</strong>,
              as well as pediatricians, genetic counsellors, and allied health professionals working in
              specialist renal and metabolic services. It is also a valuable resource for medical students
              and trainees who want structured, evidence-based learning on topics ranging from electrolyte
              disorders and dialysis to rare genetic kidney diseases and renal transplantation. The platform
              is especially well-suited to clinicians practising in India and South Asia, where localised
              drug information, NPRD network resources, and India-specific clinical context are integrated
              throughout.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-indigo-600" /> Who builds it?
            </h2>
            <p className="text-slate-600 leading-relaxed">
              CliniCals Hub is designed and developed by <strong>Swarnim</strong>, a clinician-developer
              with a deep interest in improving clinical education, rare disease recognition, and
              evidence-based practice at the point of care. The platform is continuously updated to
              reflect the latest guidelines from KDIGO, ISPN, IPNA, ESPN, and other leading organisations.
              All clinical content undergoes regular review and is presented with appropriate disclaimers —
              CliniCals Hub is a learning and decision-support aid and does not replace specialist clinical
              judgement. We welcome feedback from clinicians to improve and expand the platform.
            </p>
          </section>

          <div className="border-t border-slate-100 pt-4 flex flex-wrap gap-3">
            <Link to="/Contact" className="text-sm text-violet-700 font-semibold hover:underline flex items-center gap-1">
              <Mail className="w-4 h-4" /> Get in touch
            </Link>
            <span className="text-slate-300">|</span>
            <Link to="/" className="text-sm text-slate-500 hover:underline">← Back to Hub</Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          CliniCals Hub by Swarnim — For informational and educational purposes only. Not a substitute for clinical judgement.
        </p>
      </div>
    </div>
  );
}