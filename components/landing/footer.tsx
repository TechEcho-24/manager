"use client";

import React from "react";
import Link from "next/link";

export function FinalCTA() {
  return (
    <footer className="pt-16 md:pt-20 pb-10 px-4 md:px-6">
       <div className="max-w-7xl mx-auto rounded-[2.5rem] md:rounded-[4rem] bg-gradient-to-br from-orange-900/40 to-[#000] border border-orange-500/30 p-8 md:p-32 text-center relative overflow-hidden group">
          {/* Background Glow */}
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-orange-600/10 blur-[200px] rounded-full animate-pulse" />
          
          <div className="relative z-10 space-y-12 reveal">
             <h3 className="text-3xl md:text-6xl font-black tracking-tighter text-white italic ">Ready to  Ascend?</h3>
             <p className="max-w-2xl mx-auto text-sm md:text-xl font-bold text-white/80  ">Join 2,000+ elite teams dominating the market with Pinglly neural technology.</p>
             <div className="flex justify-center pt-8">
                <Link href="/signup" className="px-12 py-5 rounded-full btn-cyber-filled text-[13px] font-black tracking-[0.1em] text-white shadow-[0_20px_50px_rgba(255,107,53,0.3)]">
                   Connect Now
                </Link>
             </div>
          </div>
       </div>
    </footer>
  );
}

export function Footer() {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <footer className="py-20 px-6 border-t border-white/5">
       <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
          <div className="space-y-4 max-w-sm">
            <div className="flex flex-col items-center md:items-start">
               <img src="/assets/footer.png" alt="Pinglly Footer" className="h-10 object-contain" />
               <span className="text-[8px] font-bold tracking-[0.3em] text-white/30 mt-1 ml-1 uppercase">by Pinglly</span>
            </div>
            <div className="text-[11px] font-medium text-white/40 mt-4 hidden md:block transition-all duration-500 ease-in-out">
              <span className="leading-relaxed">
                Pinglly is a next-generation neural CRM designed to empower elite sales teams with AI-driven insights, seamless pipeline management, and intelligent automation
              </span>
              {!isExpanded ? (
                <button 
                  onClick={() => setIsExpanded(true)} 
                  className="inline-flex items-center justify-center text-[#ff6b35] hover:text-white transition-colors cursor-pointer text-[14px] leading-none px-1"
                  title="Read More"
                  aria-label="Expand description"
                >
                  •
                </button>
              ) : (
                <div className="mt-4 text-[10px] text-white/40 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-700 text-justify border-t border-white/5 pt-4 space-y-4">
                  <p>
                    <strong>Pinglly Core Architecture Overview:</strong> Pinglly is an advanced <Link href='/#features' className='text-[#ff6b35] hover:underline'>B2B sales automation platform</Link> that seamlessly integrates neural network technology with enterprise-grade CRM systems. Designed specifically for modern sales agencies, high-growth startups, and established B2B SaaS companies, our <Link href='/signup' className='text-[#ff6b35] hover:underline'>predictive deal tracking software</Link> provides real-time pipeline visibility and intelligent conversion metrics.
                  </p>
                  <p>
                    Secure your organization's sensitive information with our <Link href='/security' className='text-[#ff6b35] hover:underline'>military-grade encrypted client data management</Link> protocols. Eliminate friction in your outbound and inbound strategies by leveraging our automated lead routing capabilities, or connect directly with our deployment engineers via the <Link href='/contact' className='text-[#ff6b35] hover:underline'>sales and enterprise contact portal</Link> to architect custom APIs and neural pathways for your team. 
                  </p>
                  <p>
                    From <Link href='/#pricing' className='text-[#ff6b35] hover:underline'>flexible cloud pricing nodes</Link> optimized for startups, to deep machine learning models powering our conversation intelligence, Pinglly serves as the ultimate centralized hub for <Link href='/signup' className='text-[#ff6b35] hover:underline'>B2B lead generation</Link>, account-based marketing (ABM), and revenue operations (RevOps). Ensure your entire workforce remains synchronized by authenticating through our <Link href='/login' className='text-[#ff6b35] hover:underline'>secure employee login terminal</Link>. Scale your revenue velocity and maximize your team's productivity with absolute confidence, knowing your proprietary business intelligence is governed by our strict <Link href='/privacy' className='text-[#ff6b35] hover:underline'>data privacy compliance</Link> and <Link href='/terms' className='text-[#ff6b35] hover:underline'>terms of service agreements</Link>.
                  </p>
                  
                  <div className="pt-4 border-t border-white/5 text-[8px] text-white/20 leading-relaxed font-medium">
                    <strong className="block mb-2">Extended Capabilities & Keyword Index:</strong>
                    <div className="flex flex-wrap gap-x-2 gap-y-1">
                      {[
                        "B2B sales automation software", "enterprise CRM system", "AI lead scoring", "client relationship management", "predictive sales analytics", "neural network CRM", "pipeline tracking software", "automated lead routing", "outbound sales platform", "inbound marketing CRM", "sales funnel optimization", "deal closure tracking", "revenue operations (RevOps) tool", "customer success software", "B2B SaaS CRM", "small business sales tools", "startup CRM solutions", "AI sales assistant", "smart workflow automation", "real-time sales dashboard", "sales forecasting software", "contact management system", "cloud-based CRM", "mobile sales app", "lead generation platform", "B2B lead tracking", "sales team productivity software", "omnichannel sales engagement", "conversation intelligence", "customizable sales pipeline", "sales enablement software", "data-driven sales execution", "sales quota management", "performance metrics dashboard", "B2B marketing automation", "sales prospecting tools", "automated follow-up sequences", "cold outreach CRM", "social selling platform", "API integrated CRM", "secure sales database", "encrypted client data management", "SOC2 compliant CRM", "sales gamification software", "deal velocity tracking", "customer lifecycle management", "account-based marketing (ABM) CRM", "lead nurturing campaigns", "sales territory management", "multi-currency deal tracking", "visual sales pipeline", "drag-and-drop deal management", "AI email drafting", "smart meeting scheduler", "CRM for digital agencies", "real estate CRM", "financial services CRM", "healthcare sales software", "consulting CRM", "manufacturing lead tracking", "logistics sales platform", "e-commerce B2B CRM", "wholesale client management", "distribution sales software", "technology sales CRM", "software vendor CRM", "managed service provider (MSP) CRM", "IT sales tracking", "telecom lead management", "solar sales CRM", "construction bidding CRM", "automotive B2B sales", "insurance broker CRM", "wealth management CRM", "legal client intake software", "accounting firm CRM", "recruiting agency CRM", "staffing sales software", "marketing agency CRM", "SEO agency sales tool", "web development client manager", "graphic design freelance CRM", "video production sales pipeline", "event management CRM", "hospitality B2B sales", "travel agency CRM", "education recruitment software", "edtech sales platform", "corporate training CRM", "nonprofit donor management", "SaaS sales tracking", "deep learning sales algorithms", "natural language processing CRM", "machine learning lead prioritization", "automated data entry CRM", "optical character recognition (OCR) business cards", "voice-to-text sales notes", "AI call summarization", "sentiment analysis for sales", "predictive churn modeling", "customer retention software", "upsell tracking tools", "cross-sell recommendation engine", "CLV optimization", "CAC tracking", "ROAS CRM integration", "lead source attribution", "multi-touch attribution modeling", "web-to-lead forms", "LinkedIn CRM integration", "cold email deliverability tracking", "email open rate analytics", "click-through rate tracking", "A/B testing sales scripts", "dynamic email templates", "advanced sales reporting", "custom KPI dashboards", "scheduled PDF reports", "CSV lead export/import", "Zapier CRM integration", "Slack sales bot", "Microsoft Teams CRM webhook", "Google Workspace integration", "Outlook add-in", "calendar sync CRM", "task management software for sales", "collaborative selling tools", "shared team inbox", "role-based access control (RBAC)", "audit logging CRM", "enterprise-grade security", "GDPR compliant sales software", "CCPA compliant CRM", "HIPAA compliant client management", "scalable database infrastructure", "high availability CRM", "99.9% uptime sales platform", "premium UI/UX design", "dark mode CRM", "glassmorphism dashboard", "futuristic sales software", "next-generation B2B tools", "top-rated CRM 2026", "best alternative to Salesforce", "HubSpot competitor", "intuitive sales interface", "zero-learning-curve CRM"
                      ].map((kw, idx) => {
                        const routes = ["/#features", "/#pricing", "/signup", "/login", "/security", "/contact", "/privacy", "/terms"];
                        const route = routes[idx % routes.length];
                        return (
                          <React.Fragment key={idx}>
                            <Link href={route} className="hover:text-[#ff6b35] transition-colors whitespace-nowrap">
                              {kw}
                            </Link>
                            {idx !== 147 && <span className="text-white/10">,</span>}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <p className="text-[10px] font-bold text-white/20 tracking-widest mt-6 uppercase">© 2026 Neural Ops. All rights Reserved.</p>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-3 md:gap-5 mt-8 md:mt-0 uppercase">
             <Link href="/privacy" className="text-[10px] font-black tracking-widest text-white/40 hover:text-[#ff6b35] transition-colors">Privacy Policy</Link>
             <span className="text-white/10 text-[10px]">•</span>
             <Link href="/terms" className="text-[10px] font-black tracking-widest text-white/40 hover:text-[#ff6b35] transition-colors">Terms of Service</Link>
             <span className="text-white/10 text-[10px]">•</span>
             <Link href="/security" className="text-[10px] font-black tracking-widest text-white/40 hover:text-[#ff6b35] transition-colors">Security</Link>
             <span className="text-white/10 text-[10px]">•</span>
             <Link href="/contact" className="text-[10px] font-black tracking-widest text-white/40 hover:text-[#ff6b35] transition-colors">Contact</Link>
          </div>
       </div>
    </footer>
  );
}
