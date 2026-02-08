import express, {Request,Response} from "express";

const app = express();
app.get("/", (req:Request, res: Response) => {
  res.status(200).send("I'm the esteemed OneTeams server !");
});

app.listen(7000, () => {
  console.log("Server is live at http://localhost:7000");
});
