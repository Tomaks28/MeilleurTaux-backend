const express = require("express");
const router = express.Router();

//package to allow random number generation
const generator = require("generate-password");

//package to send mail
const mailgun = require("mailgun-js");

//Mailgun variables
const API_KEY = "key-0e0307189be7ed0249cbb73e7909f8cf"; // L'API_KEY fourni par mailgun
const DOMAIN = "mg.lereacteur.io"; // Le domaine fourni par mailgun

//Setting mailgun with keys
const mg = mailgun({ apiKey: API_KEY, domain: DOMAIN });

//import Simulation model
const Simulation = require("../Models/Simulation");

//Create route to get 1 simulation
router.get("/simulation", async (req, res) => {
  try {
    //Find the simulation by passing ID
    const simulations = await Simulation.findById(req.query.id);
    //send response to client
    res.send(simulations);
  } catch (err) {
    res.status(400).send({ message: "Error during fetching process" });
  }
});

//Create route to save 1 simulation
router.post("/simulation/save", async (req, res) => {
  //Check first if all parameters are presents and exists
  if (
    req.fields.goodType &&
    req.fields.goodCondition &&
    req.fields.goodUsage &&
    req.fields.userSituation &&
    req.fields.city &&
    req.fields.email &&
    req.fields.goodPrice !== undefined &&
    req.fields.buildingCosts !== undefined &&
    req.fields.charges !== undefined &&
    req.fields.total !== undefined
  ) {
    //Create new simulation by passing all parameters
    const newSimulation = new Simulation({
      goodType: req.fields.goodType,
      goodCondition: req.fields.goodCondition,
      goodUsage: req.fields.goodUsage,
      userSituation: req.fields.userSituation,
      city: req.fields.city,
      email: req.fields.email,
      goodPrice: req.fields.goodPrice,
      buildingCosts: req.fields.buildingCosts,
      charges: req.fields.charges,
      total: req.fields.total,
      //Generating random tracking number
      tracking: generator.generate({
        length: 8,
        numbers: true,
        uppercase: false,
        exclude: "abcdefghijklmnopqrstuvwxyz"
      })
    });
    try {
      //Saving the created simulation
      await newSimulation.save();
      //Sending a mail to user
      mg.messages().send(
        {
          from: "Mailgun Sandbox <postmaster@" + DOMAIN + ">",
          to: newSimulation.email,
          subject: "Simulation by tomaks",
          text: JSON.stringify(newSimulation)
        },
        function(error, body) {
          console.log(body);
        }
      );
      //Sending the new saved simulation to client
      res.send(newSimulation);
    } catch (err) {
      console.log(err);
      res.status(400).send({ message: "Error during saving process" });
    }
  } else {
    res.status(400).send({ message: "Some parameters are missing" });
  }
});

//Create route to delete 1 simulation
router.post("/simulation/delete", async (req, res) => {
  try {
    //Find the simulation to delete by id
    const simulation = await Simulation.findOne({ _id: req.fields.id });
    //if simulation exist then we delete it
    if (simulation) {
      //simulation deleting
      await simulation.remove();
      //Sending "deleted simulation" message to client
      res.send("Simulation deleted");
    } else {
      res.status(400).send({ message: "Id not found" });
    }
  } catch (err) {
    res.status(400).send({ message: "Error in ID" });
  }
});

module.exports = router;
