import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import mongoose from "mongoose";
import { Lead, LEAD_STATUSES, LEAD_PRIORITIES } from "../models/lead";
import { subDays, addDays } from "date-fns";


const MONGODB_URI = process.env.MONGODB_URI!;

const sampleFirstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"];
const sampleLastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
const sampleCompanies = ["Acme Corp", "TechStart Inc", "Global Innovations", "Stark Industries", "Wayne Enterprises", "Cyberdyne Systems", "Massive Dynamic", "Umbrella Corp", "Initech", "Hooli"];
const sampleProducts = ["Enterprise CRM", "Cloud Storage Pro", "Analytics Suite", "Marketing Automation", "HR Platform"];
const sampleSources = ["Website Form", "Cold Call", "LinkedIn", "Referral", "Trade Show"];

function randomChoice<T>(arr: readonly T[] | T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Optional: Clear existing leads
    await Lead.deleteMany({});
    console.log("Cleared existing leads");

    const leadsToCreate = 50;
    const now = new Date();

    for (let i = 0; i < leadsToCreate; i++) {
      const firstName = randomChoice(sampleFirstNames);
      const lastName = randomChoice(sampleLastNames);
      const fullName = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
      const status = randomChoice(LEAD_STATUSES);
      
      // Random creation date within last 45 days
      const daysAgo = randomInt(0, 45);
      const createdAt = subDays(now, daysAgo);
      
      // If not "New", set updatedAt to a bit later
      const updatedAt = status !== "New" ? addDays(createdAt, randomInt(1, Math.max(1, daysAgo - 1))) : createdAt;

      const nextFollowupDate = (status === "Contacted" || status === "Interested" || status === "Follow-up Required" || status === "Proposal Sent" || status === "Negotiation")
        ? addDays(now, randomInt(-2, 14)) // some overdue, some future
        : undefined;

      const activityTimeline = [];
      activityTimeline.push({
        action: "Lead created",
        description: `Lead imported via ${randomChoice(sampleSources)}`,
        createdAt: createdAt
      });

      if (status !== "New") {
        activityTimeline.push({
          action: "Status updated",
          description: `Status changed to ${status}`,
          createdAt: updatedAt
        });
      }

      const lead = new Lead({
        fullName,
        email,
        phone: `+1 ${randomInt(200, 999)}-${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
        company: randomChoice(sampleCompanies),
        designation: randomChoice(["CEO", "CTO", "Marketing Director", "Sales Manager", "VP of Engineering"]),
        leadSource: randomChoice(sampleSources),
        product: randomChoice(sampleProducts),
        budget: randomInt(5000, 50000),
        status,
        priority: randomChoice(LEAD_PRIORITIES),
        tags: [randomChoice(["B2B", "Enterprise", "Startup", "Urgent"])],
        nextFollowupDate,
        createdAt,
        updatedAt,
        activityTimeline,
        notes: [
          {
            text: "Initial contact notes...",
            createdAt: createdAt
          }
        ]
      });

      await lead.save();
    }

    console.log(`Successfully seeded ${leadsToCreate} leads!`);
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seed();
