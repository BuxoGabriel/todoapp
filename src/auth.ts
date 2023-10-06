import { NextFunction, Request, Response } from "express";
import { randomBytes } from "crypto";
import jwt from "jsonwebtoken"
import { getPrismaClient } from ".";

const TOKEN_DURR = '1h'
const KEY_LEN = 32
const secretKey = randomBytes(KEY_LEN).toString("hex")
console.log(`Secret jwt key: ${secretKey}`)

export type User = {
    username: string
}

export async function authenticateUser(username: string, password: string): Promise<boolean> {
    const prisma = getPrismaClient()
    const user = await prisma.user.findFirst({
        where: {username, password}
    })
    if (user) return true
    else return false
}

export async function createUser(username: string, password: string): Promise<User> {
    const prisma = getPrismaClient()
    return await prisma.user.create({
        data: {username, password}
    })
}

export function createJWT(username: string): string {
    return jwt.sign({ username }, secretKey, { expiresIn: TOKEN_DURR })
}

export function expressAuth(req: any, res: Response, next: NextFunction) {
    let token = req.query.token
    if (token) {
        try {
            req.token = jwt.verify(token as string, secretKey) as User
        }
        catch(jwtError) {
            res.status(401).redirect("/login/?error=Login Token Expired")
            return
        }
    }
    next()
}

export function requireAuth(req: any, res: Response, next: NextFunction) {
    if (!req.token) {
        res.status(401).redirect("/login/?error=You are not logged in")
    } else next()
}

export function auth(req: any) {
    return req.token
}