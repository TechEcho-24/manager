import { NextResponse } from "next/server";

const KNOWLEDGE_BASE = {
  system: {
    overview: "LeadPro CRM is a neural-themed sales command center designed to optimize your lead lifecycle. It combines lead tracking, financial deal management with milestones, daily productivity goals, and real-time analytics. Powered by TechEcho.",
    purpose: "The system helps sales teams transition from messy spreadsheets to a highly organized digital command center, ensuring no lead is lost and every payment is tracked.",
    branding: "Powered by TechEcho - Your Neural Sales Command Center.",
    triggers: ["what it does", "purpose", "about", "help", "kya hai", "kya karta"]
  },
  leads: {
    desc: "Leads Section: Manage prospects with 3-tier priority (High/Med/Low) and a full pipeline (New to Won/Lost). Tracks Source (LinkedIn/Web) and Product Interest.",
    triggers: ["lead", "prospect", "pipeline", "priority", "sales"]
  },
  deals: {
    desc: "Deals (Financial Command Center): Manage payments via Milestones (progress-based) or Installments (time-based). Tracks collected vs outstanding revenue.",
    triggers: ["deal", "payment", "money", "milestone", "installment", "revenue"]
  },
  workflows: {
    w1: "Workflow 1 (Adding Lead): Leads -> Add New -> Fill Form -> Submit. Boosts daily goals.",
    w2: "Workflow 2 (Follow-ups): Follow-ups -> Today's list -> Complete -> Add Notes.",
    w3: "Workflow 3 (Deals): When Won -> Deals -> Create Deal -> Select Payment Structure.",
    triggers: ["workflow", "process", "steps", "guide"]
  }
};

export async function POST(req: Request) {
  try {
    const { message, email } = await req.json();

    if (email) {
      return NextResponse.json({ 
        response: "Neural Signal Optimized. Your request is registered with TechEcho Special Operations. Expect a briefing within 24 hours.", 
        suggestions: ["Features overview", "See Dashbaord"] 
      });
    }

    const msg = message.toLowerCase();
    let response = "";
    let suggestions: string[] = ["Workflow 1", "Manage Deals", "About LeadPro"];

    // 1. Autonomous Lead Agent (Real Data Extraction & Action Trigger)
    const emailMatch = msg.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = msg.match(/\+?\d{10,12}/);
    const leadIntent = msg.includes("lead") && (msg.includes("add") || msg.includes("nayi") || msg.includes("create"));

    if (leadIntent || emailMatch || phoneMatch) {
      // Extract name (simple heuristic: look for "name is X" or "naam context")
      const nameMatch = msg.match(/(?:naam|name)(?:\s+is\s+|\s+hai\s+|\s+)(\w+)/i);
      const name = nameMatch ? nameMatch[1] : "New Prospect";
      const phone = phoneMatch ? phoneMatch[0] : "";
      const email = emailMatch ? emailMatch[0] : "";

      return NextResponse.json({ 
        response: `Neural Task Initiated: Creating lead for **${name}**. Data extracted from signal. Status: Processing Database Write...`,
        action: "CREATE_LEAD",
        leadData: { fullName: name, phone, email, source: "AI Assistant", status: "New", priority: "Medium" },
        suggestions: ["Open Leads Section", "View Dashboard"]
      });
    }
    // 2. General/System/About Intent (Global Priority)
    else if (KNOWLEDGE_BASE.system.triggers.some(t => msg.includes(t)) || msg.includes("kya hai") || msg.includes("kaise help")) {
      response = `${KNOWLEDGE_BASE.system.overview} ${KNOWLEDGE_BASE.system.purpose} ${KNOWLEDGE_BASE.system.branding || ""}`;
      suggestions = ["Explain Workflow 1", "How to manage deals?", "Pricing info"];
    } 
    // 2. Specialized Modules
    else if (KNOWLEDGE_BASE.deals.triggers.some(t => msg.includes(t))) {
      response = KNOWLEDGE_BASE.deals.desc;
      suggestions = ["Track installments", "Set milestones"];
    }
    else if (KNOWLEDGE_BASE.leads.triggers.some(t => msg.includes(t))) {
      response = KNOWLEDGE_BASE.leads.desc;
      suggestions = ["Lead priorities", "Add new lead"];
    }
    else if (KNOWLEDGE_BASE.workflows.triggers.some(t => msg.includes(t))) {
      if (msg.includes("1")) response = KNOWLEDGE_BASE.workflows.w1;
      else if (msg.includes("2")) response = KNOWLEDGE_BASE.workflows.w2;
      else if (msg.includes("3")) response = KNOWLEDGE_BASE.workflows.w3;
      else response = `Workflows: 1. Adding leads, 2. Completing follow-ups, 3. Creating deals. Which one should I explain?`;
      suggestions = ["Workflow 1", "Workflow 2", "Workflow 3"];
    }
    else if (msg.includes("founder") || msg.includes("anuj") || msg.includes("techecho")) {
      response = "LeadPro is the brainchild of Anuj Sachan, developed for high-performance sales by TechEcho. It's a next-gen Neural Sales Tool.";
      suggestions = ["App purpose", "Back to dashboard"];
    } else if (msg.includes("kaise") || msg.includes("how")) {
      response = "I can guide you through any process. For example: Workflow 1 for adding leads or Workflow 3 for creating deals. What do you need help with?";
      suggestions = ["Workflow 1", "Manage Deals"];
    }
    else {
      // Sophisticated RAG-like Fallback
      response = "Analyzing documentation layers... Identity confirmed. While I don't have a direct answer for that phrase, I can guide you through Leads, Deals, Workflows, or Analytics. Try asking 'About LeadPro' or 'Workflow 1'.";
      suggestions = ["About LeadPro", "Workflow 1", "Manage Deals"];
    }

    await new Promise(resolve => setTimeout(resolve, 1500));
    return NextResponse.json({ response, suggestions });
  } catch (error) {
    return NextResponse.json({ error: "Failure" }, { status: 500 });
  }
}
