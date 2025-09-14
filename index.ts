import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import * as database from "./config/database";
import clientRoutes from "./api/v1/routes/client/index.route";

dotenv.config();

database.connect();

const app: Express = express();
const port: number | string = process.env.PORT || 5000;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Client Routes
clientRoutes(app);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});