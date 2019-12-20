// La ligne suivante ne doit être utilisée qu'une seule fois et au tout début du projet. De préférence dans index.js
require("dotenv").config(); // Permet d'activer les variables d'environnement qui se trouvent dans le fichier `.env`

//import of all needed packages
const express = require("express");
const mongoose = require("mongoose");
const corsMiddleware = require("cors");
const formidableMiddleware = require("express-formidable");

//creating app from express and placing middlewares
const app = express();
app.use(corsMiddleware());
app.use(formidableMiddleware());

//Connect to mongoose DB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//importing backoffice routes
const backOfficeRoute = require("./Routes/backoffice");
app.use(backOfficeRoute);

//importing simulation routes
const simulationRoute = require("./Routes/simulation");
app.use(simulationRoute);

//By default all undefined routes are redirected here
app.all("*", (req, res) => {
  res.status(404).send({ message: "Page introuvable" });
});

//Sarting the server
app.listen(process.env.PORT, () => {
  console.log("Server has started");
});
