export const plans = [
  {
    name: "Starter",
    price: 2.9,
    trial: "Perfect to begin",
    limits: "500 Leads",
    badge: null,
    features: [
      { text: "500 Leads", included: true },
      { text: "1 Team Member", included: true },
      { text: "Manual Lead Entry", included: true },
      { text: "Basic Follow-ups", included: true },
      { text: "Basic Reports", included: true },
      { text: "50 Payment Reminders/mo", included: true },
      { text: "Basic Payment Links", included: true },
      { text: "Role-Based Access", included: false },
      { text: "Automation", included: false },
      { text: "Integrations", included: false },
      { text: "API Access", included: false },
      { text: "Email Support", included: true },
    ],
    buttonText: "Get Starter",
  },
  {
    name: "Growth",
    price: 6.9,
    trial: "Most Popular",
    limits: "5,000 Leads",
    badge: "Most Popular",
    highlight: true,
    features: [
      { text: "5,000 Leads", included: true },
      { text: "5 Team Members", included: true },
      { text: "Manual + Chatbot (Voice/Text)", included: true },
      { text: "Advanced Follow-ups", included: true },
      { text: "Detailed Reports", included: true },
      { text: "500 Payment Reminders/mo", included: true },
      { text: "Branded Payment Links", included: true },
      { text: "Basic Role-Based Access", included: true },
      { text: "Basic Automation", included: true },
      { text: "Limited Integrations", included: true },
      { text: "API Access", included: false },
      { text: "Priority Support", included: true },
    ],
    buttonText: "Get Growth",
  },
  {
    name: "Pro",
    price: 14.9,
    trial: "Full Power",
    limits: "Unlimited",
    badge: null,
    features: [
      { text: "Unlimited Leads", included: true },
      { text: "Unlimited Team Members", included: true },
      { text: "Manual + Chatbot + Smart AI Capture", included: true },
      { text: "Smart Auto-suggested Follow-ups", included: true },
      { text: "Advanced Reports + Insights", included: true },
      { text: "Unlimited Payment Reminders", included: true },
      { text: "Full Payment Tracking + Branding", included: true },
      { text: "Advanced Role-Based Access", included: true },
      { text: "Advanced Automation (Multi-step)", included: true },
      { text: "Full Integrations", included: true },
      { text: "API Access", included: true },
      { text: "Dedicated Support", included: true },
    ],
    buttonText: "Go Pro",
  }
];

export const comparisonData = [
  { feature: "Leads Limit", starter: "500", growth: "5,000", pro: "Unlimited" },
  { feature: "Team Members", starter: "1", growth: "5", pro: "Unlimited" },
  { feature: "Lead Add Method", starter: "Manual Only", growth: "Manual + Chatbot", pro: "Manual + Chatbot + AI" },
  { feature: "Task Assignment", starter: "Manual Text", growth: "Text + Voice 🎤", pro: "Text + Voice + Image 📸" },
  { feature: "Role-Based Access", starter: false, growth: "Basic", pro: "Advanced" },
  { feature: "Automation", starter: false, growth: "Basic", pro: "Advanced (Multi-step)" },
  { feature: "Payment Reminders", starter: "50/mo", growth: "500/mo", pro: "Unlimited" },
  { feature: "Payment Links", starter: "Basic", growth: "Branded", pro: "Full Tracking + Branding" },
  { feature: "Follow-ups", starter: "Basic", growth: "Advanced", pro: "Smart (Auto-suggested)" },
  { feature: "Reports", starter: "Basic", growth: "Detailed", pro: "Advanced + Insights" },
  { feature: "Integrations", starter: false, growth: "Limited", pro: "Full" },
  { feature: "API Access", starter: false, growth: false, pro: true },
  { feature: "Support", starter: "Email", growth: "Priority", pro: "Dedicated" },
];

export const styles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(2deg); }
  }
  @keyframes float-reverse {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(20px) rotate(-2deg); }
  }
  .floating-node-1 { animation: float 6s ease-in-out infinite; }
  .floating-node-2 { animation: float-reverse 8s ease-in-out infinite; }
  .text-glow { text-shadow: 0 0 30px rgba(255, 107, 53, 0.4); }
  .glass-chip { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,107,53,0.1); backdrop-blur: 20px; }

  .gradient-border {
    position: relative;
    padding: 1px;
    background: linear-gradient(135deg, rgba(255, 107, 53, 0.5), rgba(255, 140, 0, 0.2), transparent);
  }

  .btn-cyber-filled {
    background: linear-gradient(135deg, #ff6b35 0%, #ff8c00 100%);
    border: none;
    box-shadow: 0 0 25px rgba(255, 107, 53, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.4);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .btn-cyber-filled:hover {
    box-shadow: 0 0 45px rgba(255, 107, 53, 0.7), inset 0 1px 4px rgba(255, 255, 255, 0.6);
    transform: scale(1.05) translateY(-2px);
  }

  /* Vetra Horizon Glow Arc */
  .glow-horizon {
    position: absolute;
    bottom: -350px;
    left: 50%;
    transform: translateX(-50%);
    width: 140%;
    height: 600px;
    border-top: 2px solid rgba(255, 107, 53, 0.4);
    background: radial-gradient(50% 50% at 50% 0%, rgba(255, 107, 53, 0.35) 0%, transparent 100%);
    border-radius: 100% 100% 0 0;
    box-shadow: 0 -20px 80px rgba(255, 107, 53, 0.2);
    filter: blur(4px);
    pointer-events: none;
  }

  @keyframes reveal {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .reveal { animation: reveal 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }

  .neural-tab { position: relative; cursor: pointer; transition: all 0.3s ease; color: rgba(255,255,255,0.5); }
  .neural-tab:hover, .neural-tab.active { color: #fff; text-shadow: 0 0 10px #ff6b35; }
  .neural-tab.active::after { content: ''; position: absolute; bottom: -10px; left: 0; width: 100%; height: 2px; background: #ff6b35; box-shadow: 0 0 10px #ff6b35; }
  @keyframes slide {
    from { transform: translateX(-100%); opacity: 0; }
    50% { opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  @keyframes slide-v {
    from { transform: translateY(-100%); opacity: 0; }
    50% { opacity: 1; }
    to { transform: translateY(100%); opacity: 0; }
  }
  .animate-beam { animation: slide 6s linear infinite; }
  .animate-beam-v { animation: slide-v 8s linear infinite; }
`;
