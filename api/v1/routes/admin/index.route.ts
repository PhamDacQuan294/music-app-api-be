import { Express } from "express";
import { systemConfig } from "../../config/config";
import { topicRoutes } from "./topic.route";
import { songRoutes } from "./song.route";
import { singerRoutes } from "./singer.route";
import { roleRoutes } from "./role.route";
import { accountRoutes } from "./account.route";
import { authRoutes } from "./auth.route";

import * as authMiddleware from "../../middlewares/admin/auth.middleware";
import { statisticsRoutes } from "./statistics.route";

const adminRoutes = (app: Express): void => {

  const PATH_ADMIN = `${systemConfig.prefixAdmin}`;

  app.use(`${PATH_ADMIN}/topics`, authMiddleware.requireAuth, topicRoutes);

  app.use(`${PATH_ADMIN}/songs`, songRoutes);

  app.use(`${PATH_ADMIN}/singers`, singerRoutes);

  app.use(`${PATH_ADMIN}/roles`, roleRoutes);

  app.use(PATH_ADMIN + "/accounts", accountRoutes);

  app.use(PATH_ADMIN + "/auth", authRoutes);

  app.use(PATH_ADMIN + "/statistics", statisticsRoutes);
}

export default adminRoutes;