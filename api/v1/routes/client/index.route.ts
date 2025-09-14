import { Express } from "express";
import { topicRoutes } from "./topic.route";

const clientRoutes = (app: Express): void => {
  
  const version = "/api/v1";

  app.use(version + "/topics", topicRoutes);
}

export default clientRoutes;