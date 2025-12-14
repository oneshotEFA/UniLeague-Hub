import express, { Express, Request, Response } from "express";
import apiRouter from "./router";
//import any listener u add in the event so it get register before it emits
import "./events/listeners";
const app: Express = express();
const port = 3000;
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("running trial");
});
app.use("/api/v1", apiRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
