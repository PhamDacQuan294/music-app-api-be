import { Request, Response } from "express";
import Account from "../../models/account.model";
import Role from "../../models/role.model";
import md5 from "md5";

// [GET] /admin/accounts
export const index = async (req: Request, res: Response) => {
  let find = {
    deleted: false
  };

  const records = await Account.find(find).select("-password-token");

  const results: any[] = [];

  for (const record of records) {
    const role = await Role.findOne({
      _id: record.role_id,
      deleted: false
    });

    const item = JSON.parse(JSON.stringify(record));
    item.role = role;
    results.push(item);
  }

  res.json({
    code: 200,
    accounts: results
  })
}

// [POST] /admin/accounts/create
export const createPost = async (req: Request, res: Response) => {
  const emailExist = await Account.findOne({
    email: req.body.email,
    deleted: false
  });

  if (emailExist) {
    res.json({
      code: 400,
      message: "Email này đã tồn tại!",
    });
    return;
  } 

  req.body.password = md5(req.body.password);
  req.body.avatar = req.body.avatar[0];

  const record = new Account(req.body);
  await record.save();

  res.json({
    code: 200,
    message: "Tạo tài khoản admin thành công!"
  })
}