import { Express } from "express";
import { systemConfig } from "../../../../config/config";
import { topicRoutes } from "./topic.route";

const adminRoutes = (app: Express): void => {

  const PATH_ADMIN = `/${systemConfig.prefixAdmin}`;

  app.use(`${PATH_ADMIN}/topics`, topicRoutes);
}

export default adminRoutes;