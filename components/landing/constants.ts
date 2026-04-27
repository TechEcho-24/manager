import React from "react";
import { 
  Zap, 
  Shield, 
  Cpu, 
  Activity, 
  Layers, 
  Lock,
  Search,
  Phone,
  Mail,
  UserPlus,
  Eye,
  Building2,
  Loader2,
  MousePointer2
} from "lucide-react";

export const plans = [
  {
    name: "Starter Node",
    price: "0",
    trial: "14 Days Full Access",
    limits: "50 Leads/mo (Verify Only)",
    features: ["AI Hub V1 (Limited)", "Standard Latency Sync", "Community Support Only", "Manual Lead Upload"],
    buttonText: "Start Trial",
  },
  {
    name: "Pro Core",
    price: "9.9",
    trial: "Full Autonomy",
    limits: "Unlimited Leads",
    features: ["Neural Sync Engine", "AI Voice Synthesis", "Multi-Client Partitions", "Priority API", "Custom Dashboards"],
    buttonText: "Join Pro",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "14.9",
    trial: "Global Scale",
    limits: "Dedicated Cluster",
    features: ["White Label Core", "Private Database", "24/7 Security Squad", "Custom Fine-Tuning", "Manager Portals"],
    buttonText: "Contact Ops",
  }
];

export const comparisonData = [
  { feature: "Leads Synchronization", lite: "50/mo", pro: "Unlimited", enterprise: "Unlimited" },
  { feature: "AI Voice Synthesis", lite: "No", pro: "Standard", enterprise: "Ultra-HD" },
  { feature: "Neural Pathway Sync", lite: "1h Delay", pro: "Real-time", enterprise: "Predictive" },
  { feature: "Security Protocols", lite: "L1", pro: "L3 Quantum", enterprise: "Titan Level" },
  { feature: "Global Partitions", lite: "1 Node", pro: "5 Nodes", enterprise: "Unlimited" },
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
