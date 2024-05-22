import AuthService from "./auth.service.js";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcryptjs";
import { EncodeData, DecodeData } from "../../utils/jwtEncoder.js";

const AuthController = {
  Login: async (req, res) => {
    const { email, password } = req.body;
    let [user] = await AuthService.getUserByEmail(email)

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "El correo electrónico no se encuentra registrado" });
    }
    
    const passCorrect = await bcrypt.compare(password, user.password)

    if (!passCorrect) {
      return res.status(StatusCodes.BAD_REQUEST).send({ error: 'Contraseña incorrecta' })
    }

    const payload = {
      uuid: user.uuid,
      email
    }

    const token = EncodeData(payload, "1h")

    return res.status(StatusCodes.OK).send(token)
  },
  CurrentUser: async (req, res) => {
    const { authorization } = req.headers
    const payload = DecodeData(authorization)
    const { uuid } = payload

    if (!uuid) {
      return res.status(StatusCodes.BAD_REQUEST).send({ error: 'Faltan parámetros' })
    }

    let [user] = await AuthService.getUserByUUID(uuid)

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).send({ error: 'Usuario no encontrado' })
    }

    const userData = {
      ...user,
    }
    delete userData.password

    res.status(StatusCodes.OK).send(userData)
  }
}

export default AuthController;