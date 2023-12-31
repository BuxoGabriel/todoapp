import { randomBytes } from "crypto";
import { genSalt, hash } from "bcrypt";
import jwt from "jsonwebtoken"
import { getPrismaClient } from ".";

const SALT_ROUNDS = 10
const TOKEN_DURR = '1h'
const KEY_LEN = 32
const secretKey = randomBytes(KEY_LEN).toString("hex")
console.log(`Secret jwt key: ${secretKey}`)

export type User = {
    username: string,
    joined: Date,
    id: number
}

export const getJwtKey = () => secretKey

export async function authenticateUser(username: string, password: string): Promise<User | null> {
    const prisma = getPrismaClient()
    const user = await prisma.user.findFirst({
        where: {username}
    })
    if (user) {
        const hashpass = await hash(password, user.salt)
        if(hashpass == user.password) return {username: user.username, joined: user.joined, id: user.id}
        else return null
    }
    else return null
}

export async function createUser(username: string, password: string): Promise<User> {
    const salt = await genSalt(SALT_ROUNDS)
    const hashpass = await hash(password, salt)
    const prisma = getPrismaClient()
    return await prisma.user.create({
        data: {username, password: hashpass, salt}
    })
}

export function createJWT(username: string, id: number): string {
    return jwt.sign({ username, id }, secretKey, { expiresIn: TOKEN_DURR })
}