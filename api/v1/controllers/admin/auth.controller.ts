import { Request, Response } from "express";
import Account from "../../models/account.model";
import md5 from "md5";

// [POST] /admin/auth/login
export const loginPost = async (req: Request, res: Response) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await Account.findOne({
    email: email,
    deleted: false
  });

  if (!user) {
    res.json({
      code: 400,
      message: "Email không tồn tại!",
    })

    return;
  }

  if (md5(password) != user.password) {
    res.json({
      code: 400,
      message: "Mật khẩu không đúng!",
    })
    return;
  }

  if (user.status == "inactive") {
    res.json({
      code: 403,
      message: "Tài khoản của bạn đang bị khóa. Vui lòng liên hệ quản trị viên.",
    })
    return;
  }

  res.json({
    code: 200,
    message: "Đăng nhập thành công!",
    data: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      token: user.token,
      role: user.role_id,
    },
  })
}