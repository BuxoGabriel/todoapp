import { NextFunction, Request, Response, Router } from "express"
import asyncHandler from "express-async-handler"
import { body, validationResult } from "express-validator"

import { getPrismaClient } from ".."
import { getAuth } from "../middleware/auth"

const todoApi = Router()

todoApi.post("/", [
    body("task")
        .trim()
        .isLength({min: 1})
        .escape(),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.sendStatus(400)
            return
        }
        const user = getAuth(req)
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

todoApi.put("/", [
    body("id")
        .trim()
        .isNumeric()
        .escape(),
    body("completed")
        .isBoolean()
        .escape(),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(400).json(errors.array())
            return
        }
        const user = getAuth(req)
        const id = parseInt(req.body.id)
        const completed = req.body.completed === "true"
        if(!user) {
            res.sendStatus(401)
            return
        }
        if(isNaN(id)) {
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

todoApi.delete("/:id", asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = getAuth(req)
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

export default todoApi