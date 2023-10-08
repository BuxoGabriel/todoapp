import { Router } from "express"
import { body, validationResult } from "express-validator"
import asyncHandler from "express-async-handler"
import todoRouter from "./todo"
import { authenticateUser, createJWT, createUser } from "../auth"

const router = Router()

router.use("/todo", todoRouter)

router.get("/", (req, res, next) => {
    req.url = "/login"
    next()
})

router.get("/login", (req, res) => {
    res.render("login", {title: "Todo App login", error: req.query.error})
})

router.post("/login", [
    body("username")
        .trim()
        .isLength({min: 1})
        .toLowerCase()
        .escape(),
    body("password")
        .trim()
        .isLength({min: 1})
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
        }  catch(err) {
            console.error(err)
            res.sendStatus(500)
            return
        }
        if(user != null) {
            const token = createJWT(user.username, user.id)
            res.redirect(`/todo/?token=${token}`)
        } else {
            // If authentication fails send back 401 unauthorized error
            res.redirect("/login/?error=Wrong username or password")
        }
    })
])

router.get("/register", (req, res) => {
    res.render("register", {title: "Todo App register"})
})


router.post("/register", [
    body("username")
        .trim()
        .isLength({min: 1})
        .toLowerCase()
        .escape(),
    body("password")
        .trim()
        .isLength({min: 1})
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
        } catch(err) {
            console.error(err)
            res.sendStatus(500)
            return
        }
        const token = createJWT(username, user.id)
        res.redirect(`/todo/?token=${token}`)
    })
])

export default router;