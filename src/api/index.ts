import { Router } from "express"
import asyncHandler from "express-async-handler"
import { body, validationResult } from "express-validator"

import { authenticateUser, createJWT } from "../auth"

const secretKey = "secret-key"

function createApiRouter(): Router {
    const router = Router()
    router.post("/login", [
        body("username"),
        body("password"),
        asyncHandler((req, res, next) => {
            console.log("post login")
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                res.sendStatus(400)
            }
            const { username, password } = req.body
            if (authenticateUser(username, password)) {
                const token = createJWT(username)
                res.redirect(`/todo/?token=${token}`)
            } else {
                // If authentication fails send back 401 unauthorized error
                res.status(401).json({ error: "Authentication Failed" })
            }

        })
    ])
    return router
}

export default createApiRouter()