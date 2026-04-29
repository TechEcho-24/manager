"use client";

import React from "react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export default function TermsOfServicePage() {
  return (
    <div className="bg-[#000] selection:bg-[#ff6b35]/30 relative min-h-screen flex flex-col text-white">
      <Navbar />
      
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 right-1/2 translate-x-1/2 w-[800px] h-[500px] bg-[#ff6b35]/10 blur-[150px] rounded-full opacity-50" />
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />
      </div>

      <main className="relative z-10 flex-grow max-w-4xl mx-auto px-6 pt-40 pb-24 w-full">
        <div className="space-y-6 mb-16 border-b border-white/10 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff6b35]/10 border border-[#ff6b35]/20 text-[#ff6b35] text-[10px] font-black uppercase tracking-widest">
             Legal Compliance
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">Terms of Service</h1>
          <p className="text-white/50 text-sm md:text-base font-medium tracking-wide">Last Updated: April 30, 2026</p>
        </div>

        <div className="space-y-12 text-white/70 prose prose-invert prose-orange max-w-none prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[#ff6b35] hover:prose-a:text-orange-400">
          
          <section>
            <h2 className="text-2xl text-white mb-4">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing, registering for, or using Pinglly CRM ("the Service"), operated by Pinglly ("Company", "we", "us", or "our"), 
              you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl text-white mb-4">2. Description of Service</h2>
            <p className="leading-relaxed">
              Pinglly is an AI-powered Customer Relationship Management (CRM) platform designed for B2B sales infrastructure. 
              The Service includes a dashboard, lead management, deal tracking, analytics, and access to the "Neural Core" AI assistant. 
              We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time, with or without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl text-white mb-4">3. User Accounts & Responsibilities</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials. You must immediately notify us of any unauthorized use of your account.</li>
              <li><strong>Acceptable Use:</strong> You agree not to use the Service for any unlawful purpose, to upload malicious code, or to attempt to bypass the platform's security mechanisms.</li>
              <li><strong>Data Accuracy:</strong> You are solely responsible for the accuracy, quality, and legality of the data you input into the Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl text-white mb-4">4. Intellectual Property Rights</h2>
            <p className="leading-relaxed">
              The Service, including its original content, features, software, algorithms, UI/UX designs, and trademarks (including the "Pinglly" brand), 
              are and will remain the exclusive property of Pinglly and its licensors. You retain all rights to the customer data you upload to the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl text-white mb-4">5. Subscription & Payment Terms</h2>
            <p className="leading-relaxed">
              Some aspects of the Service may be billed on a subscription basis. You will be billed in advance on a recurring schedule (monthly or annually). 
              If payment is not successfully settled, we may suspend your access to the Service until payment is received. All fees are non-refundable unless 
              required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl text-white mb-4">6. Limitation of Liability</h2>
            <p className="leading-relaxed">
              In no event shall Pinglly, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, 
              special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, 
              resulting from your access to or use of or inability to access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl text-white mb-4">7. Changes to Terms</h2>
            <p className="leading-relaxed">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide 
              at least 30 days' notice prior to any new terms taking effect. By continuing to access or use our Service after those revisions become effective, 
              you agree to be bound by the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl text-white mb-4">8. Contact Information</h2>
            <p className="leading-relaxed">
              If you have any questions about these Terms, please contact us at:<br/>
              <strong>Pinglly Legal Department</strong><br/>
              Email: support@techecho.in<br/>
            </p>
          </section>
          
        </div>
      </main>

      <Footer />
    </div>
  );
}
