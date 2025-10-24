import { Router } from "express";
const router: Router = Router();

import * as controller from "../../controllers/admin/auth.controller"

router.post(
  "/login", 
  controller.loginPost
);

router.post(
  "/varify", 
  controller.verify
);

export const authRoutes: Router = router;