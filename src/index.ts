import path from "path"
import express from "express"
import dotenv from "dotenv"
dotenv.config()

const PORT = process.env.PORT || 3000
const app = express()

app.use(express.static(path.resolve(__dirname, "../static")))
app.set('views', path.join(__dirname, '../views'))
app.set("view engine", "pug")
app.get("/", (req, res) => {
    res.render("index", {title: "Todo App", message: "hello world!"})
})

app.listen(PORT, () => {
    console.log("listening on port " + PORT)
})