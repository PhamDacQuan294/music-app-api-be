import { Router } from "express";
const router: Router = Router();

import * as controller from "../../controllers/admin/statistics.controller"

router.get(
  "/songs", 
  controller.index
);


export const statisticsRoutes: Router = router;