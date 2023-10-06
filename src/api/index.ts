import { Router } from "express"
import asyncHandler from "express-async-handler"
import { body, validationResult } from "express-validator"

import { auth, authenticateUser, createJWT, createUser, expressAuth, requireAuth } from "../auth"
import { getPrismaClient } from ".."

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
                const token = createJWT(user.username, user.id)
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
            const token = createJWT(username, user.id)
            res.redirect(`/todo/?token=${token}`)
        })
    ])

    router.post("/todo", [
        body("task")
            .trim()
            .isLength({min: 1})
            .escape(),
        asyncHandler(async (req, res, next) => {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                console.error(errors)
                res.status(400).json(errors.array())
                return
            }
            const user = auth(req)
            const prisma = getPrismaClient()
            const task = req.body.task
            if(!user) {res.sendStatus(401); return}
            await prisma.todo.create({data: {
                text: task,
                userId: user.id
            }})
            res.sendStatus(200);
        })
    ])

    router.delete("/todo/:id", asyncHandler(async (req, res, next) => {
        const user = auth(req)
        const id = parseInt(req.params.id)
        if(isNaN(id) || !user) {
            res.sendStatus(400)
            return
        }
        const prisma = getPrismaClient()
        const todo = await prisma.todo.delete({where: {
            userId : user.id,
            id
        }})

        if(todo) {
            res.sendStatus(200)
            return
        } else {
            res.sendStatus(400)
            return
        }
    }))
    return router
}

export default createApiRouter()