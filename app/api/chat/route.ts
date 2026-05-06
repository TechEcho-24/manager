import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import { Lead } from "@/models/lead";

// ============================================================
//  PINGLLY SYSTEM PROMPT — Full Knowledge Base
// ============================================================
const PINGLLY_SYSTEM_PROMPT = `
Tumhara naam "Ping" hai aur tum Pinglly ke official AI assistant ho.
Tum existing users ki help karte ho — unhe features use karna sikhate ho,
plans samjhate ho, pricing batate ho, aur unke har sawaal ka jawab dete ho.

## Pinglly kya hai?
Pinglly ek smart CRM (Customer Relationship Management) system hai jisme
businesses apne contacts, leads, tasks, sales pipeline aur team ko ek hi
jagah se manage kar sakte hain. Sabse khaas baat — VOICE se bhi sab kuch
control kiya ja sakta hai. Chatbot (Ping) se directly baat karke bhi kaam
ho jaata hai.

## Pinglly ke Fayde (Benefits):
- Sab kuch ek jagah — contacts, tasks, deals, team, payments ek dashboard par
- Voice se manage karo — type karne ki zaroorat nahi, bol do kaam ho jayega
- Time bachta hai — automation se follow-ups aur reminders khud chale jaate hain
- Koi lead miss nahi hoti — pipeline hamesha updated rehti hai
- Chhote aur bade dono businesses ke liye suitable
- Mobile par bhi poora kaam hota hai
- Pro mein AI features — smart suggestions aur insights milti hain

---

## Pinglly ke Main Features:

### 1. Contact & Lead Management
- Naye contacts aur leads add karo (manually, chatbot se, ya AI se — plan ke hisaab se)
- Poori history ek jagah — calls, notes, follow-ups
- Leads ko status se filter karo: New, In Progress, Converted, Lost
- Import/Export contacts support

### 2. Task Management (Image + Video + Voice)
- Tasks create karo, team members ya clients ko assign karo
- Task ke saath IMAGE attach karo (site photo, document, screenshot)
- Task ke saath VIDEO attach karo (demo ya instruction)
- VOICE NOTE record karke task mein attach karo
- Status track karo: Pending → In Progress → Done
- Deadline aur automatic reminders

### 3. Voice Integration (Pinglly ki USP)
- Microphone icon press karo aur bol do — kaam ho jayega
- Example: "Ramesh ka kal 3 baje follow-up set karo" → task ban jaayega
- Voice notes seedha contacts aur tasks mein save hote hain
- Hands-free CRM — driving ya meeting mein bhi use karo

### 4. Chatbot (Ping) se Direct Management
- Ping se baat karo aur seedha kaam karo
- "Aaj ke pending tasks dikhao", "Naya lead add karo", "Pipeline status batao"
- Pro plan mein AI khud suggest karta hai kaunsa lead hot hai

### 5. Sales Pipeline
- Stages: Lead → Qualified → Proposal → Negotiation → Won/Lost
- Visual board — drag & drop se deals move karo
- Expected value aur closing date set karo

### 6. Payment Reminders & Links
- Customers ko payment reminder bhejo
- Payment links banao (plan ke hisaab se basic/branded/full tracking)
- Monthly limits: Starter 50/mo, Growth 500/mo, Pro unlimited

### 7. Follow-ups
- Starter: Basic follow-ups
- Growth: Advanced follow-ups
- Pro: Smart AI-suggested follow-ups — AI batata hai kab aur kaise follow-up karo

### 8. Reports & Analytics
- Starter: Basic reports
- Growth: Detailed reports
- Pro: Advanced reports + AI insights — trends aur predictions bhi

### 9. Automation
- Growth: Basic automation (jaise automatic welcome message)
- Pro: Advanced multi-step automation (lead aaya → task assign → reminder gaya → follow-up schedule hua)

### 10. Integrations & API
- Starter: Limited integrations
- Growth: Full integrations
- Pro: Full integrations + API access (apne tools se connect karo)

### 11. Team Management
- Roles: Admin, Manager, Member
- Tasks distribute karo team mein
- Activity log dekho
- Limits: Starter 1 member, Growth 5 members, Pro unlimited

---

## Pinglly Plans & Pricing:

### STARTER PLAN
Monthly price: $2.9/month
Yearly price: $2.61/month (10% off) = $31.32/year — $3.48 bachao
Best for: Solopreneurs aur individuals jo basic CRM chahte hain

Kya milta hai:
- Leads: 500 tak
- Team: 1 member (sirf aap)
- Lead add karne ka tarika: Sirf manually
- Tasks: Sirf text
- Role-based access: Basic
- Payment reminders: 50/month
- Payment links: Basic
- Follow-ups: Basic
- Reports: Basic reports
- Integrations: Limited
- Support: Email support
- Automation: Nahi
- Voice tasks: Nahi
- API access: Nahi

Signup link: pinglly.com/signup?plan=Starter

---

### GROWTH PLAN (MOST POPULAR)
Monthly price: $6.9/month
Yearly price: $6.21/month (10% off) = $74.52/year — $8.28 bachao
Best for: Chhoti teams aur growing businesses

Kya milta hai:
- Leads: 5,000 tak
- Team: 5 members
- Lead add karne ka tarika: Manual + Chatbot se bhi
- Tasks: Text + Voice note attach kar sakte ho
- Role-based access: Advanced
- Payment reminders: 500/month
- Payment links: Branded payment links
- Follow-ups: Advanced
- Reports: Detailed reports
- Integrations: Full integrations
- Support: Priority support
- Automation: Basic automation
- Voice tasks: Haan
- API access: Nahi

Signup link: pinglly.com/signup?plan=Growth

---

### PRO PLAN
Monthly price: $14.9/month
Yearly price: $13.41/month (10% off) = $160.92/year — $17.88 bachao
Best for: Badi teams, agencies, power users

Kya milta hai:
- Leads: Unlimited
- Team: Unlimited members
- Lead add karne ka tarika: Manual + Chatbot + AI (AI khud leads suggest karta hai)
- Tasks: Text + Voice + Image — sab kuch attach kar sakte ho
- Role-based access: Advanced
- Payment reminders: Unlimited
- Payment links: Full tracking + Custom branding
- Follow-ups: Smart AI-suggested follow-ups
- Reports: Advanced reports + AI insights
- Integrations: Full integrations
- Support: Dedicated support (sabse fast)
- Automation: Advanced multi-step automation
- Voice tasks: Haan
- API access: Haan

Signup link: pinglly.com/signup?plan=Pro

---

## Yearly Savings (10% Discount):
- Starter yearly: $31.32/year (monthly ki jagah yearly lo, $3.48 bachao)
- Growth yearly: $74.52/year ($8.28 bachao)
- Pro yearly: $160.92/year ($17.88 bachao)

---

## Kaun sa Plan Lena Chahiye?
- Akele kaam karte ho, abhi shuru kar rahe ho → STARTER ($2.9/mo)
- 2-5 log ki team hai, leads zyada hain → GROWTH ($6.9/mo) — sabse popular
- Badi team, automation chahiye, AI features chahiye → PRO ($14.9/mo)
- Confuse ho kaunsa plan lein → Growth best choice hai, upgrade karna aasaan hai

---

## Tumhara Kaam (Rules):

1. LANGUAGE: User jis language mein baat kare — Hindi, English ya Hinglish — usi mein jawab do. Language switch mat karo beech mein.

2. PRICE POOCHHE: Exact price batao — monthly aur yearly dono. Yearly savings bhi mention karo.

3. PLAN COMPARISON: Clearly batao kis plan mein kya milta hai aur kya nahi milta.

4. FEATURE NAHI HAI: Agar user ke plan mein feature nahi hai toh bolo "Yeh [Growth/Pro] plan mein available hai — upgrade karke use kar sakte ho."

5. SHORT JAWAB: 3-5 lines kafi hain. Steps explain karne ho toh numbered list use karo.

6. VOICE HIGHLIGHT KARO: Jab bhi relevant ho, voice aur AI features ki USP mention karo.

7. HONEST RAHO: Jo nahi pata uske liye bolo "Iske liye support@pinglly.com se contact karein."

8. SIGNUP LINKS: Plan lene ya upgrade ke liye signup links do jo upar diye hain.

9. LEAD MANAGEMENT: Agar user lead add karna chahta hai ya lead-related data (naam, email, phone) share kare, toh unhe confirm karo ki lead create ho rahi hai. Data extract karo aur action trigger karo.
`;

// ============================================================
//  LANGUAGE DETECTION
// ============================================================
function detectLanguage(message: string): "hindi" | "english" | "hinglish" {
  const hindiUnicode = /[\u0900-\u097F]/;
  const hindiRomanWords =
    /\b(kya|hai|kaise|karo|mujhe|aap|nahi|haan|theek|batao|dikhao|chahiye|wala|mera|tera|unka|kab|kahan|kyun|kaun|kitna|sab|yeh|wo|aur|par|se|ko|ka|ki|ke|bhi|toh|agar|lekin|sirf|bahut|accha|thoda|zaroor|seedha|poora|plan|price|kitne|bata|lo|do|lena|kaunsa|wali|karta|karti|milta|milti)\b/i;

  if (hindiUnicode.test(message)) return "hindi";
  if (hindiRomanWords.test(message)) return "hinglish";
  return "english";
}

// ============================================================
//  LEAD INTENT DETECTION
// ============================================================
function detectLeadIntent(msg: string): boolean {
  return (
    msg.includes("lead") &&
    (msg.includes("add") ||
      msg.includes("nayi") ||
      msg.includes("naya") ||
      msg.includes("create") ||
      msg.includes("new") ||
      msg.includes("banao") ||
      msg.includes("daalo"))
  );
}

// ============================================================
//  MAIN ROUTE HANDLER
// ============================================================
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const { message, conversationHistory = [], email: contactEmail } = await req.json();

    // ── Special: Contact/Demo request via email ──────────────
    if (contactEmail) {
      return NextResponse.json({
        reply:
          "Neural Signal Optimized. Your request is registered with Pinglly Special Operations. Expect a briefing within 24 hours.",
        suggestions: ["Features overview", "See Dashboard"],
      });
    }

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const msg = message.toLowerCase();

    // ── Autonomous Lead Agent ────────────────────────────────
    const emailMatch = msg.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = msg.match(/\+?\d{10,12}/);
    const leadIntent = detectLeadIntent(msg);

    // Not logged in but trying to add lead
    if (!session?.user && leadIntent) {
      return NextResponse.json({
        reply: "Lead add karne ke liye pehle login karein. Aap mujhse Pinglly features, pricing, aur plans ke baare mein pooch sakte hain bina login ke.",
        action: "LOGIN_REQUIRED",
        suggestions: ["About Pinglly", "Features overview", "Pricing info"],
      });
    }

    // Logged in + lead intent or contact data detected
    if (session?.user && (leadIntent || emailMatch || phoneMatch)) {
      const nameMatch = msg.match(/(?:naam|name)(?:\s+is\s+|\s+hai\s+|\s+)(\w+)/i);
      const name = nameMatch ? nameMatch[1] : "New Prospect";
      const phone = phoneMatch ? phoneMatch[0] : "";
      const email = emailMatch ? emailMatch[0] : "";

      return NextResponse.json({
        reply: `Lead create ho rahi hai **${name}** ke liye. Data extract ho gaya — database mein save ho raha hai...`,
        action: "CREATE_LEAD",
        leadData: {
          fullName: name,
          phone,
          email,
          source: "AI Assistant",
          status: "New",
          priority: "Medium",
        },
        suggestions: ["Open Leads Section", "View Dashboard"],
      });
    }

    // ── Gemini API Call ──────────────────────────────────────
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      let crmContext = "";
      if (session?.user) {
        try {
          await dbConnect();
          const user = session.user as any;
          const orgId = user.organizationId || user.id;

          const leads = await Lead.find({ organizationId: orgId })
            .sort({ updatedAt: -1 })
            .limit(50)
            .lean();

          if (leads && leads.length > 0) {
            const summarizedLeads = leads.map((l: any) => {
              let summary = `- Name: ${l.fullName}`;
              if (l.company) summary += `, Company: ${l.company}`;
              summary += `, Status: ${l.status}`;
              
              if (l.dealDetails && l.dealDetails.totalValue > 0) {
                summary += `, Deal Value: ₹${l.dealDetails.totalValue}, Received: ₹${l.dealDetails.receivedAmount}`;
                const pendingInst = l.dealDetails.installments?.filter((i: any) => i.status === 'pending') || [];
                if (pendingInst.length > 0) {
                  const nextDue = pendingInst.sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
                  if (nextDue) {
                    summary += `, Next Payment Due: ₹${nextDue.amount} on ${new Date(nextDue.dueDate).toISOString().split('T')[0]}`;
                  }
                }
              }
              if (l.nextFollowupDate) {
                summary += `, Follow-up: ${new Date(l.nextFollowupDate).toISOString().split('T')[0]}`;
              }
              return summary;
            });

            crmContext = `\n\n--- LIVE CRM DATA (DO NOT INVENT DATA, USE THIS TO ANSWER) ---\nHere are the user's recent leads and their payment/due details:\n${summarizedLeads.join('\n')}\nIf the user asks about payments, due dates, latest leads, or follow-ups, use ONLY the data above to answer. Give direct, short answers.`;
          }
        } catch (err) {
          console.error("Failed to fetch CRM context:", err);
        }
      }

      const langInstruction = "User is speaking in English. Reply in English only. Keep responses short and professional.";

      const rawContents = [
        ...conversationHistory
          .filter((turn: any) => turn.content && typeof turn.content === "string" && turn.content.trim() !== "")
          .map(
            (turn: { role: string; content: string }) => ({
              role: turn.role === "assistant" ? "model" : "user",
              parts: [{ text: turn.content }],
            })
          ),
        {
          role: "user",
          parts: [{ text: message }],
        },
      ];

      const contents: any[] = [];
      for (const msg of rawContents) {
        const last = contents[contents.length - 1];
        if (last && last.role === msg.role) {
          last.parts[0].text += `\n\n${msg.parts[0].text}`;
        } else {
          contents.push({ role: msg.role, parts: [{ text: msg.parts[0].text }] });
        }
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [
                { text: `${PINGLLY_SYSTEM_PROMPT}\n\n${langInstruction}${crmContext}` },
              ],
            },
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4000,
            },
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
           throw new Error("API Limit Reached: We are receiving too many requests right now. Please wait about a minute and try again.");
        }
        const err = await response.text();
        console.error("Gemini API error:", err);
        throw new Error(`Gemini API rejected request: ${err}`);
      }

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!reply) throw new Error("Empty response from Gemini");

      return NextResponse.json({ response: reply });
    }

    // ── Ollama (Local, uncomment to use) ────────────────────
    /*
    const ollamaResponse = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:3b",
        messages: [
          { role: "system", content: PINGLLY_SYSTEM_PROMPT },
          ...conversationHistory.map((t: { role: string; text: string }) => ({
            role: t.role === "assistant" ? "assistant" : "user",
            content: t.text,
          })),
          { role: "user", content: message },
        ],
        stream: false,
      }),
    });
    const ollamaData = await ollamaResponse.json();
    return NextResponse.json({ reply: ollamaData.message.content });
    */

    // ── Fallback ─────────────────────────────────────────────
    return NextResponse.json({
      response: "System initialization in progress. Please ensure GEMINI_API_KEY is configured in your environment.",
    });
  } catch (error) {
    console.error("Chat route error:", error);
    return NextResponse.json(
      {
        response: `An internal error occurred while connecting to the AI core. Error: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 }
    );
  }
}