import { StatusCodes } from 'http-status-codes'
import { DecodeData } from '../utils/jwtEncoder.js'

export default async (req, res, next) => {
  const token = req.headers.authorization
  const publicRoute =
    ((req.method === 'PUT' && req.url.includes("/s3/upload")) ||
    (req.method === 'POST' && req.url.includes("/image/upload")) ||
    (req.method === 'POST' && req.url.includes("/auth/login")) ||
    (req.method === 'GET' && req.url.includes("/discipline")) ||
    (req.method === 'GET' && req.url.includes("/teacher")))
  if (publicRoute) {
    next()
  } else {
    if (!token) {
      return res.status(StatusCodes.BAD_REQUEST).send({ error: 'ERROR_NO_TOKEN' })
    }

    const decodedToken = DecodeData(token)
    if (!decodedToken) {
      return res.status(StatusCodes.UNAUTHORIZED).send({ error: 'ERROR_INVALID_TOKEN' })
    }

    const { uuid, email } = decodedToken
    if (!uuid || !email) {
      return res.status(StatusCodes.UNAUTHORIZED).send({ error: 'ERROR_INVALID_TOKEN' })
    }

    req.payload = {
      ...req.payload,
      email,
      uuid
    }
    next()
  }
}