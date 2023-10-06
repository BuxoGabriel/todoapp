import path from "path"
import express from "express"
import dotenv from "dotenv"

import apiRouter from "./api"
import { auth, expressAuth, requireAuth } from "./auth"
dotenv.config()

const PORT = process.env.PORT || 3000
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(expressAuth)

app.use(express.static(path.join(__dirname, '../static')))
app.set('views', path.join(__dirname, '../views'))
app.set("view engine", "pug")

app.get("/", (req, res, next) => {
    req.url = "/login"
    next()
})

app.get("/login", (req, res) => {
    res.render("login", {title: "Todo App login"})
})

app.get("/register", (req, res) => {
    res.render("login", {title: "Todo App register"})
})

app.get("/todo", requireAuth)
app.get("/todo", (req, res) => {
    const {username} = auth(req)
    res.render("todo", {username})
})

app.use("/api", apiRouter)

app.listen(PORT, () => {
    console.log("listening on port " + PORT)
})