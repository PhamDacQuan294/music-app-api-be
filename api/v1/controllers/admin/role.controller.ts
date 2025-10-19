import e, { Request, Response } from "express";
import Role from "../../models/role.model";

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

// [PATCH] /admin/roles/edit/:id
export const editPatch = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await Role.updateOne({ _id: id }, req.body);

    const updatedRole = await Role.findById(id);

    res.json({
      code: 200,
      role: updatedRole
    })
  } catch (error) {
    console.log(error);
    res.json({
      code: 500
    })
  }
}

// [DELETE] /admin/roles/delete/:id
export const deleteItem = async (req: Request, res: Response) => {
  try {
    const id: string = req.params.id;

    await Role.updateOne({ _id: id }, {
      deleted: true,
      deletedAt: new Date()
    });
    res.json({
      code: 200,
      id
    })
  } catch (error) {
    console.log(error);
    res.json({
      code: 500
    })
  }
}
