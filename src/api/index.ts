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

    router.post("/todo", [
        body("task")
            .trim()
            .isLength({min: 1})
            .escape(),
        asyncHandler(async (req, res, next) => {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                res.sendStatus(400)
                return
            }
            const user = auth(req)
            const prisma = getPrismaClient()
            const task = req.body.task
            if(!user) {res.sendStatus(401); return}
            let newTodo 
            try {
                newTodo = await prisma.todo.create({data: {
                    text: task,
                    userId: user.id
                }})
            } catch(err) {
                console.error(err)
                res.sendStatus(500)
                return
            }
            res.json(newTodo)
            return
        })
    ])

    router.put("/todo", [
        body("id")
            .trim()
            .isNumeric()
            .escape(),
        body("completed")
            .isBoolean()
            .escape(),
        asyncHandler(async (req, res, next) => {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                res.status(400).json(errors.array())
                return
            }
            const user = auth(req)
            const id = parseInt(req.body.id)
            const completed = req.body.completed === "true"
            if(!user || isNaN(id)) {
                res.sendStatus(400)
                return
            }
            const prisma = getPrismaClient()
            let todo
            try {
                todo = await prisma.todo.update({
                    data: { completed },
                    where: {id, userId: user.id},
                    
                })
            } catch(err) {
                console.error(err)
                res.sendStatus(500)
                return
            }
            if(todo) {
                res.sendStatus(200)
                return
            } else {
                res.sendStatus(400)
                return
            }
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
        let todo
        try {
            todo = await prisma.todo.delete({where: {
                userId : user.id,
                id
            }})
        } catch(err) {
            console.error(err)
            res.sendStatus(500)
            return
        }

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