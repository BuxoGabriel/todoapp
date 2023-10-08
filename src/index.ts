import path from "path"
import express from "express"
import logger from "morgan"
import dotenv from "dotenv"
import { PrismaClient } from "@prisma/client"

import appRouter from "./routes"
import { expressAuth } from "./middleware/auth"
import apiRouter from "./api"
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

app.use(appRouter)
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