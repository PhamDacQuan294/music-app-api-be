import { Request, Response } from "express";
import Role from "../../models/role.model";
import { systemConfig } from "../../config/config";

// [GET] /admin/roles
export const index = async (req: Request, res: Response) => {
  let find = {
    deleted: false
  };

  const records = await Role.find(find);

  res.json({
    code: 200,
    records: records
  })
}

// [POST] /admin/roles/create
export const createPost = async (req: Request, res: Response) => {
  const record = new Role(req.body);
  await record.save();

  res.redirect(`/${systemConfig.prefixAdmin}/roles/permissions`);
}