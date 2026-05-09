const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI || "mongodb+srv://task:manager@appmanager.haebgjj.mongodb.net/?appName=appmanager";
const { Schema, model } = mongoose;

const OrganizationSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    ownerId: { type: String, required: true, index: true },
    logoUrl: { type: String },
    primaryColor: { type: String },
  },
  { strict: false, timestamps: true }
);

const Organization = mongoose.models.Organization || model("Organization", OrganizationSchema);

mongoose.connect(uri).then(async () => {
  let org = await Organization.findOne({ ownerId: "techecho.kanpur@gmail.com" });
  if (org) {
    console.log("Before:", org.logoUrl);
    org.logoUrl = "https://example.com/logo.png";
    await org.save();
    let orgAfter = await Organization.findOne({ ownerId: "techecho.kanpur@gmail.com" });
    console.log("After:", orgAfter.logoUrl);
  }
  process.exit(0);
});
