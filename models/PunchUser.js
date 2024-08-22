import mongoose from "mongoose";

const PunchSchema = new mongoose.Schema({
    userId: String,
    Location: String,
    punchType: String,
    time:{
      type: Date,
      default: Date.now
    },
    date: { type: Date, default: Date.now },
  });
  
  const PunchModel = mongoose.model('Punch_in_out', PunchSchema);
  
  export default PunchModel