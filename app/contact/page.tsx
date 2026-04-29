"use client";

import React from "react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Mail, MapPin, Phone, Send, MessageSquare } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="bg-[#000] selection:bg-[#ff6b35]/30 relative min-h-screen flex flex-col text-white">
      <Navbar />
      
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-[#ff6b35]/10 blur-[150px] rounded-full opacity-40" />
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />
      </div>

      <main className="relative z-10 flex-grow max-w-7xl mx-auto px-6 pt-40 pb-24 w-full">
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff6b35]/10 border border-[#ff6b35]/20 text-[#ff6b35] text-[10px] font-black uppercase tracking-widest mx-auto">
             Get in touch
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tight italic">Contact Core</h1>
          <p className="text-white/50 text-sm md:text-xl font-medium tracking-wide max-w-2xl mx-auto">
            Ready to upgrade your sales infrastructure? Connect with our team to deploy Pinglly CRM for your organization.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          
          {/* Contact Information Side */}
          <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-[#ff6b35]/30 transition-all group">
                <div className="h-12 w-12 rounded-full bg-[#ff6b35]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Mail className="h-5 w-5 text-[#ff6b35]" />
                </div>
                <h3 className="text-xl font-bold mb-2">Email Support</h3>
                <p className="text-white/50 text-sm mb-4">For technical issues or general inquiries.</p>
                <a href="mailto:support@techecho.in" className="text-white font-bold tracking-wider hover:text-[#ff6b35] transition-colors">support@techecho.in</a>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-[#ff6b35]/30 transition-all group">
                <div className="h-12 w-12 rounded-full bg-[#ff6b35]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Phone className="h-5 w-5 text-[#ff6b35]" />
                </div>
                <h3 className="text-xl font-bold mb-2">Sales Hotline</h3>
                <p className="text-white/50 text-sm mb-4">Direct line to our enterprise sales team.</p>
                <a href="tel:+919876543210" className="text-white font-bold tracking-wider hover:text-[#ff6b35] transition-colors">+91 98765 43210</a>
              </div>

            </div>

            <div className="bg-gradient-to-br from-[#ff6b35]/10 to-transparent border border-[#ff6b35]/20 rounded-3xl p-8 relative overflow-hidden">
               <div className="absolute -right-10 -bottom-10 opacity-10">
                 <MapPin className="w-40 h-40 text-[#ff6b35]" />
               </div>
               <div className="relative z-10">
                 <h3 className="text-2xl font-black italic mb-4">Global Headquarters</h3>
                 <p className="text-white/60 leading-relaxed font-medium">
                   TechEcho Innovations<br />
                   Level 42, Neural Tech Park<br />
                   Kanpur, Uttar Pradesh<br />
                   India 208001
                 </p>
               </div>
            </div>
          </div>

          {/* Contact Form Side */}
          <div className="bg-[#050505] border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff6b35] to-transparent opacity-50" />
            
            <div className="mb-8 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white/50" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Send a Message</h2>
                <p className="text-xs text-white/40 tracking-widest uppercase mt-1">Encrypted Transmission</p>
              </div>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/50 tracking-widest uppercase">Full Name</label>
                  <input type="text" placeholder="John Doe" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#ff6b35]/50 focus:bg-white/10 transition-all font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/50 tracking-widest uppercase">Email Address</label>
                  <input type="email" placeholder="john@company.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#ff6b35]/50 focus:bg-white/10 transition-all font-medium" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/50 tracking-widest uppercase">Company / Organization</label>
                <input type="text" placeholder="Acme Corp" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#ff6b35]/50 focus:bg-white/10 transition-all font-medium" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/50 tracking-widest uppercase">Message</label>
                <textarea rows={4} placeholder="How can Pinglly assist your team?" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#ff6b35]/50 focus:bg-white/10 transition-all font-medium resize-none" />
              </div>

              <button className="w-full py-4 rounded-xl btn-cyber-filled text-white font-black tracking-[0.2em] uppercase flex items-center justify-center gap-3 group mt-4">
                <span>Transmit Request</span>
                <Send className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
