import express from "express";

const app = express();
app.get("/", (req, res: any) => {
  res.status(200).send("I'm the esteemed OneTeams server !");
});


//just a setup


app.listen(7000, () => {
  console.log("Server is live at http://localhost:7000");
});
