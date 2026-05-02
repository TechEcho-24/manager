import dbConnect from "./lib/db";
import { Organization } from "./models/organization";
import { Lead } from "./models/lead";
import mongoose from "mongoose";

async function debugData() {
  await dbConnect();
  console.log("Checking Organizations...");
  const orgs = await Organization.find({ "subscription.status": "active" }).limit(10);
  
  for (const org of orgs) {
    const leadsCount = await Lead.countDocuments({ 
      $or: [
        { organizationId: org._id.toString() },
        { organizationId: org._id }
      ]
    });
    console.log(`Org: ${org.name}, ID: ${org._id}, Leads: ${leadsCount}`);
  }
  
  const totalLeads = await Lead.countDocuments({});
  console.log(`Total Leads in DB: ${totalLeads}`);
  
  process.exit(0);
}

debugData();
