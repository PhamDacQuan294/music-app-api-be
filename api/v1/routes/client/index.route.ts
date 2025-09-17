import { Express } from "express";
import { topicRoutes } from "./topic.route";
import { songRoutes } from "./song.route";
import { favoriteSongRoutes } from "./favorite-song.route";
import { searchRoutes } from "./search.route";

const clientRoutes = (app: Express): void => {
  
  const version = "/api/v1";

  app.use(version + "/topics", topicRoutes);

  app.use(version + "/songs", songRoutes);

  app.use(version + "/favorite-songs", favoriteSongRoutes);

  app.use(version + "/search", searchRoutes);
}

export default clientRoutes;