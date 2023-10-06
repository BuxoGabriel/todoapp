import { Router } from "express"
import asyncHandler from "express-async-handler"
import { body, validationResult } from "express-validator"

import { authenticateUser, createJWT, createUser } from "../auth"

const secretKey = "secret-key"

function createApiRouter(): Router {
    const router = Router()
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
            const user = await authenticateUser(username, password)
            if (user != null) {
                const token = createJWT(user.username)
                res.redirect(`/todo/?token=${token}`)
            } else {
                // If authentication fails send back 401 unauthorized error
                res.redirect("/login/?error=Wrong username or password")
            }
        })
    ])

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
            const user = await createUser(username, password)
            const token = createJWT(username)
            res.redirect(`/todo/?token=${token}`)
        })
    ])
    return router
}

export default createApiRouter()