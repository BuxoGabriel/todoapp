import { NextFunction, Request, Response } from "express";
import { randomBytes } from "crypto";
import jwt from "jsonwebtoken"

const TOKEN_DURR = '1h'
const KEY_LEN = 32
const secretKey = randomBytes(KEY_LEN).toString("hex")
console.log(`Secret jwt key: ${secretKey}`)

export type User = {
    username: string
}

export function authenticateUser(username: string, password: string): boolean {
    if (username == "username" && password == "password") return true
    else return false
}

export function createJWT(username: string): string {
    return jwt.sign({ username }, secretKey, { expiresIn: TOKEN_DURR })
}

export function expressAuth(req: any, res: Response, next: NextFunction) {
    let token = req.query.token
    if (token) {
        req.token = jwt.verify(token as string, secretKey) as User
    }
    next()
}

export function requireAuth(req: any, res: Response, next: NextFunction) {
    if (!req.token) {
        res.status(401).json({ error: "You are not logged in" })
    } else next()
}

export function auth(req: any) {
    return req.token
}