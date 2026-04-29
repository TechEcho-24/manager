"use client";

import React from "react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export default function SecurityPage() {
  return (
    <div className="bg-[#000] selection:bg-[#ff6b35]/30 relative min-h-screen flex flex-col text-white">
      <Navbar />
      
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#ff6b35]/10 blur-[150px] rounded-full opacity-40" />
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />
      </div>

      <main className="relative z-10 flex-grow max-w-4xl mx-auto px-6 pt-40 pb-24 w-full">
        <div className="space-y-6 mb-16 border-b border-white/10 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff6b35]/10 border border-[#ff6b35]/20 text-[#ff6b35] text-[10px] font-black uppercase tracking-widest">
             Infrastructure
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">Security Center</h1>
          <p className="text-white/50 text-sm md:text-base font-medium tracking-wide">Last Updated: April 30, 2026</p>
        </div>

        <div className="space-y-12 text-white/70 prose prose-invert prose-orange max-w-none prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[#ff6b35] hover:prose-a:text-orange-400">
          
          <section>
            <h2 className="text-2xl text-white mb-4">1. Enterprise-Grade Protection</h2>
            <p className="leading-relaxed">
              At Pinglly, security is not an afterthought—it's the foundation of our neural infrastructure. We employ 
              military-grade encryption and zero-trust principles to ensure your B2B sales data remains impenetrable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl text-white mb-4">2. Data Encryption</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>In Transit:</strong> All data transmitted between your clients and Pinglly is encrypted using TLS 1.3 with perfect forward secrecy.</li>
              <li><strong>At Rest:</strong> Customer data is encrypted at rest in our databases using AES-256 encryption. Our encryption keys are managed securely via AWS KMS.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl text-white mb-4">3. AI & Neural Core Security</h2>
            <p className="leading-relaxed mb-4">
              We understand the sensitivity of feeding proprietary sales data into AI models. Here is our commitment:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>No Cross-Training:</strong> Your data is siloed. We never use your organization's data to train public foundational models.</li>
              <li><strong>Ephemeral Processing:</strong> Neural Core interactions are processed in volatile memory where possible and scrubbed periodically.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl text-white mb-4">4. Access Control & Authentication</h2>
            <p className="leading-relaxed">
              Access to the Pinglly platform is gated by NextAuth. We enforce strict role-based access control (RBAC), 
              ensuring that users only have access to the data necessary for their specific roles. Administrative actions 
              are logged in an immutable audit trail.
            </p>
          </section>

          <section>
            <h2 className="text-2xl text-white mb-4">5. Vulnerability Management</h2>
            <p className="leading-relaxed">
              We conduct automated vulnerability scanning continuously and perform manual penetration testing annually. 
              Our infrastructure is monitored 24/7 by automated threat detection systems that automatically quarantine anomalous traffic patterns.
            </p>
          </section>

          <section>
            <h2 className="text-2xl text-white mb-4">6. Report a Vulnerability</h2>
            <p className="leading-relaxed">
              We believe in working closely with the security research community. If you believe you have found a security 
              vulnerability in Pinglly, please report it immediately. We will investigate all legitimate reports and do our best 
              to quickly fix the problem.
            </p>
            <p className="leading-relaxed mt-4">
              <strong>Security Team Contact</strong><br/>
              Email: support@techecho.in<br/>
            </p>
          </section>
          
        </div>
      </main>

      <Footer />
    </div>
  );
}
