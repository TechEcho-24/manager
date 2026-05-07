const mongoose = require('mongoose');

const schema1 = new mongoose.Schema({ name: String });
mongoose.model('Test', schema1);

delete mongoose.models.Test;

try {
  mongoose.model('Test', new mongoose.Schema({ name: String, newField: String }));
  console.log("Success");
} catch (e) {
  console.log("Error:", e.message);
}
