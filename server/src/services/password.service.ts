import * as bcryptTs from "bcrypt-ts";

export default class PasswordService {
  static async hash(password: string): Promise<string> {
    const bcrypt: any = await (bcryptTs as any)["default"]
    return bcrypt.hashSync(password, bcrypt.genSaltSync())
  }

  static async verify(password: string, hash: string): Promise<boolean> {
    const bcrypt: any = await (bcryptTs as any)["default"]
    return bcrypt.compareSync(password, hash)
  }
}