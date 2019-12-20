const mongoose = require("mongoose");

//Create msimulation model for mongoose DB
const Simulation = mongoose.model("simulation", {
  goodType: String,
  goodCondition: String,
  goodUsage: String,
  userSituation: String,
  city: String,
  email: String,
  goodPrice: Number,
  buildingCosts: Number,
  charges: Number,
  total: Number,
  tracking: String
});

module.exports = Simulation;
