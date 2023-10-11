import { Router } from "express"
import asyncHandler from "express-async-handler"
import { getPrismaClient } from ".."
import { getAuth, pageRequireAuth } from "../middleware/auth"

const todoRouter = Router()

todoRouter.get("/", pageRequireAuth)
todoRouter.get("/", asyncHandler(async (req, res) => {
    const prisma = getPrismaClient()
    const {username, id} = getAuth(req)!
    let tasks
    try {
        tasks = await prisma.todo.findMany({
            where: {
                userId: id
            },
            orderBy: {
                date: "asc"
            }
        })
    } catch(err) {
        console.error(err)
        res.sendStatus(500)
        return
    }
    res.render("todo", {username, tasks})
}))

export default todoRouter