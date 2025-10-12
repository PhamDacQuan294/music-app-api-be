import { Router } from "express";
import multer from "multer";
const router: Router = Router();
import { uploadFields } from "../../middlewares/admin/uploadCloud.middleware";

import * as controller from "../../controllers/admin/topic.controller";

const upload = multer();

router.get("/", controller.index);

router.patch("/change-status/:status/:id", controller.changeStatus);

router.patch("/change-multi", controller.changeMulti);

router.post(
  "/create", 
  upload.fields([
    { name: 'avatar', maxCount: 1 }, 
    { name: 'audio', maxCount: 1 }
  ]),
  uploadFields, 
  controller.createPost
);

router.delete("/delete/:id", controller.deleteTopic);

router.patch(
  "/edit/:id", 
  upload.fields([
    { name: 'avatar', maxCount: 1 }, 
  ]),
  uploadFields, 
  controller.editPatch
);


export const topicRoutes: Router = router;