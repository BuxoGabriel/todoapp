import jwt from "jsonwebtoken"
import { NextFunction, Request, Response } from "express"
import { User, getJwtKey } from "../auth"

export interface AuthReq extends Request {
    token: User | null
    expired: boolean
}

export function expressAuth(req: Request, res: Response, next: NextFunction) {
    const authReq = req as AuthReq
    let token = req.query.token
    if (!token) {
        const authorization: string | undefined = req.headers.authorization
        if(authorization) token = authorization.split(" ")[1]
    }
    try {
        authReq.token = jwt.verify(token as string, getJwtKey()) as User
    }
    catch(jwtError) {
        authReq.expired = true
        authReq.token = null
    }
    next()
}

export function pageRequireAuth(req: Request, res: Response, next: NextFunction) {
    const authReq = req as AuthReq
    if(authReq.expired) {
        res.status(401).redirect("/login/?error=Login token expired")
        return
    }
    if (!authReq.token) {
        res.status(401).redirect("/login/?error=You are not logged in")
        return
    } else next()
}