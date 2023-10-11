import jwt from "jsonwebtoken"
import { NextFunction, Request, Response } from "express"
import { User, getJwtKey } from "../auth"

export interface AuthReq extends Request {
    token: string | null
    user: User | null
    expired: boolean
}

export function auth(req: Request, res: Response, next: NextFunction) {
    const authReq = req as AuthReq
    let token: string | undefined = req.cookies.token
    if (!token) {
        const authorization: string | undefined = req.headers.authorization
        if(authorization && authorization.startsWith("Bearer ")) token = authorization.substring(7)
    }
    try {
        if(token) {
            authReq.user = jwt.verify(token, getJwtKey()) as User
            authReq.token = token
        }
        else {
            authReq.user = null
            authReq.token = null
        }
    }
    catch(jwtError) {
        authReq.expired = true
        authReq.user = null
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

export function apiRequireAuth(req: Request, res: Response, next: NextFunction) {
    const authReq = req as AuthReq
    if(authReq.expired) {
        res.status(401).send("Login token expired")
        return
    }
    else if(!authReq.token) {
        res.status(401).redirect("Authorization Header invalid")
        return
    }
    else next()
}

export function getAuth(req: Request): User | null {
    if('token' in req) {
        const authReq = req as AuthReq
        return authReq.user
    }
    return null;
}