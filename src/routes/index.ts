import { Router } from "express"
import { body, validationResult } from "express-validator"
import asyncHandler from "express-async-handler"
import todoRouter from "./todo"
import { authenticateUser, createJWT, createUser } from "../auth"
import { getAuth } from "../middleware/auth"

const router = Router()

router.get("/", (req, res, next) => {
    const user = getAuth(req)
    if(!user) req.url = "/login"
    else {
        req.url = "/todo"
    }
    next()
})

router.use("/todo", todoRouter)

router.get("/login", (req, res) => {
    res.render("login", { title: "Todo App login", error: req.query.error })
})

router.post("/login", [
    body("username")
        .trim()
        .isLength({ min: 1 })
        .toLowerCase()
        .escape(),
    body("password")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.sendStatus(400)
        }
        const { username, password } = req.body
        let user
        try {
            user = await authenticateUser(username, password)
        } catch (err) {
            console.error(err)
            res.sendStatus(500)
            return
        }
        if (user != null) {
            // user has valid credentials set jwt in cookie
            const token = createJWT(user.username, user.id)
            // in production make sure cookie is secure
            const secure = process.env.NODE_ENV == "production"
            res.cookie("token", token, { httpOnly: true, secure })
            res.redirect("/todo")
            return
        } else {
            // If authentication redirect to login page
            res.status(401).redirect("/login/?error=Incorrect username or password")
            return
        }
    })
])

router.get("/register", (req, res) => {
    res.render("register", { title: "Todo App register" })
})


router.post("/register", [
    body("username")
        .trim()
        .isLength({ min: 1 })
        .toLowerCase()
        .escape(),
    body("password")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.sendStatus(400)
        }
        const { username, password } = req.body
        let user
        try {
            user = await createUser(username, password)
        } catch (err) {
            console.error(err)
            res.sendStatus(500)
            return
        }
        // user has valid credentials set jwt in cookie
        const token = createJWT(user.username, user.id)
        // in production make sure cookie is secure
        const secure = process.env.NODE_ENV == "production"
        res.cookie("token", token, { httpOnly: true, secure })
        res.redirect("/todo")
    })
])

router.post("/logout", (req, res) => {
    res.clearCookie("token")
    res.redirect("/login")
})

export default router;