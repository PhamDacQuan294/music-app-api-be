import { Router } from "express";
const router: Router = Router();

import * as controller from "../../controllers/admin/singer.controller";

router.get("/", controller.index);

router.patch("/change-multi", controller.changeMulti);

export const singerRoutes: Router = router;