"use client";

import React from "react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#000] selection:bg-[#ff6b35]/30 relative min-h-screen flex flex-col text-white">
      <Navbar />
      
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#ff6b35]/10 blur-[150px] rounded-full opacity-50" />
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />
      </div>

      <main className="relative z-10 flex-grow max-w-4xl mx-auto px-6 pt-40 pb-24 w-full">
        <div className="space-y-6 mb-16 border-b border-white/10 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff6b35]/10 border border-[#ff6b35]/20 text-[#ff6b35] text-[10px] font-black uppercase tracking-widest">
             Legal Compliance
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">Privacy Policy</h1>
          <p className="text-white/50 text-sm md:text-base font-medium tracking-wide">Last Updated: April 30, 2026</p>
        </div>

        <div className="space-y-12 text-white/70 prose prose-invert prose-orange max-w-none prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[#ff6b35] hover:prose-a:text-orange-400">
          
          <section>
            <h2 className="text-2xl text-white mb-4">1. Introduction</h2>
            <p className="leading-relaxed">
              At Pinglly ("we," "our," or "us"), we are committed to protecting the privacy and security of our users. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the 
              Pinglly CRM platform, its associated APIs, AI models, and mobile applications (collectively, the "Services").
            </p>
          </section>

          <section>
            <h2 className="text-2xl text-white mb-4">2. Information We Collect</h2>
            <p className="leading-relaxed mb-4">We collect information that you provide directly to us when you register for an account, interact with our Neural Core AI, or integrate third-party data sources.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Data:</strong> Name, email address, company details, billing information.</li>
              <li><strong>CRM Data:</strong> Leads, contacts, deals, communications, and any other proprietary business data you input into Pinglly.</li>
              <li><strong>AI Interaction Data:</strong> Prompts, queries, and feedback provided to our chatbot interfaces.</li>
              <li><strong>Automated Data:</strong> IP addresses, browser types, usage patterns, and telemetry data via cookies and tracking technologies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl text-white mb-4">3. How We Use Your Information</h2>
            <p className="leading-relaxed mb-4">Your data is utilized strictly to provide, improve, and secure our Services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provision and maintain your Pinglly workspace.</li>
              <li>To process transactions and send related billing information.</li>
              <li>To train and refine your organization-specific AI models (your data is <strong>never</strong> used to train public foundational models).</li>
              <li>To detect, prevent, and address technical issues or security breaches.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl text-white mb-4">4. Data Sharing & Disclosure</h2>
            <p className="leading-relaxed">
              We do not sell your personal or business data to third parties. We may share information with trusted third-party vendors, 
              hosting providers, and payment processors who assist us in operating our platform, provided they agree to keep this information 
              confidential and adhere to strict security protocols. We may also disclose information if required by law or in response to valid 
              requests by public authorities.
            </p>
          </section>

          <section>
            <h2 className="text-2xl text-white mb-4">5. Data Security</h2>
            <p className="leading-relaxed">
              We use administrative, technical, and physical security measures, including AES-256 encryption at rest and TLS 1.3 in transit, 
              to help protect your personal information. While we have taken reasonable steps to secure the data you provide to us, please be aware 
              that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against 
              any interception or other type of misuse.
            </p>
          </section>

          <section>
            <h2 className="text-2xl text-white mb-4">6. Your Data Rights</h2>
            <p className="leading-relaxed mb-4">Depending on your location, you may have the following rights regarding your personal data:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The right to access and receive a copy of your data.</li>
              <li>The right to rectify or update inaccurate data.</li>
              <li>The right to request deletion of your data ("Right to be Forgotten").</li>
              <li>The right to restrict or object to our processing of your data.</li>
            </ul>
            <p className="mt-4 text-sm text-white/50">To exercise these rights, contact our Data Protection Officer at support@techecho.in.</p>
          </section>

          <section>
            <h2 className="text-2xl text-white mb-4">7. Contact Us</h2>
            <p className="leading-relaxed">
              If you have questions or comments about this Privacy Policy, please contact us at: <br/>
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
