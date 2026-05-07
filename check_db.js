const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI || "mongodb+srv://task:manager@appmanager.haebgjj.mongodb.net/?appName=appmanager";

mongoose.connect(uri).then(async () => {
  const orgs = await mongoose.connection.collection('organizations').find({}).toArray();
  console.log(JSON.stringify(orgs, null, 2));
  process.exit(0);
});
