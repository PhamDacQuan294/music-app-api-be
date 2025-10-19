import e, { Request, Response } from "express";
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
  try {
    const record = new Role(req.body);
    await record.save();

    res.json({
      code: 200
    })
  } catch (error) {
    console.log(error);
    res.json({
      code: 500
    })
  }
}