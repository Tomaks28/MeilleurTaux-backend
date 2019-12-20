// La ligne suivante ne doit être utilisée qu'une seule fois et au tout début du projet. De préférence dans index.js
require("dotenv").config(); // Permet d'activer les variables d'environnement qui se trouvent dans le fichier `.env`

const express = require("express");
const mongoose = require("mongoose");
const corsMiddleware = require("cors");
const formidableMiddleware = require("express-formidable");
const generator = require("generate-password");
const mailgun = require("mailgun-js");
/************************************************************************************************/
const API_KEY = "key-0e0307189be7ed0249cbb73e7909f8cf"; // L'API_KEY fourni par mailgun
const DOMAIN = "mg.lereacteur.io"; // Le domaine fourni par mailgun
const mg = mailgun({ apiKey: API_KEY, domain: DOMAIN });
/************************************************************************************************/

const app = express();
app.use(corsMiddleware());
app.use(formidableMiddleware());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

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

app.get("/backoffice", async (req, res) => {
  try {
    const simulations = await Simulation.find();
    res.send(simulations);
  } catch (err) {
    res.status(400).send("Error during fetching process");
  }
});

app.post("/save", async (req, res) => {
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
    tracking: generator.generate({
      length: 8,
      numbers: true,
      uppercase: false,
      exclude: "abcdefghijklmnopqrstuvwxyz"
    })
  });
  try {
    await newSimulation.save();
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
    res.send(newSimulation);
  } catch (err) {
    console.log(err);
    res.status(400).send("Error during saving process");
  }
});

app.post("/delete", async (req, res) => {
  try {
    const simulation = await Simulation.findOne({ _id: req.fields.id });
    if (simulation) {
      await simulation.remove();
      res.send("Simulation deleted");
    } else {
      res.status(400).send("Id not found");
    }
  } catch (err) {
    res.status(400).send("Error in ID");
  }
});

app.all("*", (req, res) => {
  res.status(404).send("Page introuvable");
});

// Remarquez que le `app.listen` doit se trouver après les déclarations des routes
app.listen(process.env.PORT, () => {
  console.log("Server has started");
});
