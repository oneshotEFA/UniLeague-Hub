import express, { Express, Request, Response } from "express";
import { login } from "./modules/auth/auth.route";

const app: Express = express();
const port = 3000;
app.use(express.json());

app.get("/", async (req: Request, res: Response) => {
  const data = await login();
  res.send("running trial :" + data);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
