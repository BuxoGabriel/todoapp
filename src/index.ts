import path from "path"
import express from "express"
import dotenv from "dotenv"
dotenv.config()

const PORT = process.env.PORT || 3000
const app = express()

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

app.listen(PORT, () => {
    console.log("listening on port " + PORT)
})