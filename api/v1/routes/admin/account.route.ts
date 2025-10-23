import { Router } from "express";
import multer from "multer";
import { uploadFields } from "../../middlewares/admin/uploadCloud.middleware";

const router: Router = Router();

import * as controller from "../../controllers/admin/account.controller"

const upload = multer();

router.get("/", controller.index);

router.post(
  "/create", 
  upload.fields([
    { name: 'avatar', maxCount: 1 }, 
  ]),
  uploadFields, 
  controller.createPost
);


export const accountRoutes: Router = router;