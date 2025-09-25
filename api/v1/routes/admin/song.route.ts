import { Router } from "express";
import multer from "multer";
const router: Router = Router();
import { uploadFields } from "../../middlewares/admin/uploadCloud.middleware";
import { createPost } from "../../controllers/admin/song.controller";
import * as controller from "../../controllers/admin/song.controller";

const upload = multer();

router.get("/", controller.index);

router.get("/create", controller.create);

router.post(
  "/create", 
  upload.fields([
    { name: 'avatar', maxCount: 1 }, 
    { name: 'audio', maxCount: 1 }
  ]),
  uploadFields, 
  createPost
);

router.delete("/delete/:id", controller.deleteSong);

router.patch(
  "/edit/:id", 
  upload.fields([
    { name: 'avatar', maxCount: 1 }, 
    { name: 'audio', maxCount: 1 }
  ]),
  uploadFields, 
  controller.editPatch
);

router.get("/search-song", controller.searchSong)

export const songRoutes: Router = router;