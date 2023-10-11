import { Router } from "express"
import todoApi from "./todo"
import { apiRequireAuth } from "../middleware/auth"

const apiRouter = Router()

apiRouter.use(apiRequireAuth)
apiRouter.use("/todo", todoApi)

export default apiRouter;