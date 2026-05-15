import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MessageSquare, ArrowLeft, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Compose mailto link as the contact method
    const subject = encodeURIComponent(`CliniCals Hub — Message from ${form.name}`);
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    window.open(`mailto:clinicalshub.swarnim@gmail.com?subject=${subject}&body=${body}`, "_blank");
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Hero */}
        <div className="bg-gradient-to-br from-blue-700 to-indigo-800 rounded-2xl p-8 text-white mb-8 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Contact Us</h1>
              <p className="text-blue-200 text-sm mt-0.5">We'd love to hear from you</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">

          {/* Direct email */}
          <div className="flex items-start gap-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800">Email us directly</p>
              <a
                href="mailto:clinicalshub.swarnim@gmail.com"
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                clinicalshub.swarnim@gmail.com
              </a>
              <p className="text-xs text-slate-500 mt-1">
                For feedback, clinical content suggestions, bug reports, or collaboration enquiries.
              </p>
            </div>
          </div>

          {/* Contact form */}
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-slate-500" />
                <h2 className="font-semibold text-slate-800">Send a message</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-xs mb-1 block">Your Name</Label>
                  <Input
                    id="name"
                    placeholder="Dr. Jane Smith"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-xs mb-1 block">Your Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="message" className="text-xs mb-1 block">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Your feedback, suggestion, or question…"
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="min-h-[120px]"
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11">
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </form>
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
              <p className="font-semibold text-slate-800 text-lg">Thank you!</p>
              <p className="text-slate-500 text-sm">Your email client has opened with your message. We'll get back to you soon.</p>
              <Button variant="outline" onClick={() => setSent(false)} className="mt-2">Send another message</Button>
            </div>
          )}

          <div className="border-t border-slate-100 pt-4">
            <Link to="/About" className="text-sm text-slate-500 hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> About CliniCals Hub
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          CliniCals Hub by Swarnim — For informational and educational purposes only.
        </p>
      </div>
    </div>
  );
}