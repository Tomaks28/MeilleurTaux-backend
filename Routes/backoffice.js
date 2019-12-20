const express = require("express");
const router = express.Router();

//import Simulation model
const Simulation = require("./Models/Simulation");

//Create route to backoffice
router.get("/backoffice", async (req, res) => {
  try {
    //Get all datas from simulation DB
    const simulations = await Simulation.find();
    //send response to client
    res.send(simulations);
  } catch (err) {
    res.status(400).send({ message: "Error during fetching process" });
  }
});

module.exports = router;
