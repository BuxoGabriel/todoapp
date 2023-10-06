import path from "path"
import express from "express"
import asyncHandler from "express-async-handler"
import logger from "morgan"
import dotenv from "dotenv"
import { PrismaClient } from "@prisma/client"

import apiRouter from "./api"
import { auth, expressAuth, requireAuth } from "./auth"
dotenv.config()

const prisma = new PrismaClient()

export const getPrismaClient = () => prisma

const PORT = process.env.PORT || 3000
const app = express()

app.use(logger("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(expressAuth)

app.use(express.static(path.join(__dirname, '../public')))
app.set('views', path.join(__dirname, '../views'))
app.set("view engine", "pug")

app.get("/", (req, res, next) => {
    req.url = "/login"
    next()
})

app.get("/login", (req, res) => {
    res.render("login", {title: "Todo App login", error: req.query.error})
})

app.get("/register", (req, res) => {
    res.render("register", {title: "Todo App register"})
})

app.get("/todo", requireAuth)
app.get("/todo", asyncHandler(async (req, res) => {
    const prisma = getPrismaClient()
    const {username, id} = auth(req)!
    const tasks = await prisma.todo.findMany({
        where: {
            userId: id
        },
        orderBy: {
            date: "asc"
        }
    })
    res.render("todo", {username, tasks})
}))

app.use("/api", apiRouter)

app.listen(PORT, () => {
    console.log("listening on port " + PORT)
})

async function gracefulShutdown() {
    await prisma.$disconnect()
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon