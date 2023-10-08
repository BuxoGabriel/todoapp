import { Router } from "express"
import todoApi from "./todo"

const apiRouter = Router()

apiRouter.use("/todo", todoApi)

export default apiRouter;