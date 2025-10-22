import { Router } from "express";
const router: Router = Router();

import * as controller from "../../controllers/admin/role.controller";

router.get("/", controller.index);

router.post("/create", controller.createPost);

router.patch("/edit/:id", controller.editPatch);

router.delete("/delete/:id", controller.deleteItem);

router.patch("/permissions", controller.permissionsPatch);

export const roleRoutes: Router = router;