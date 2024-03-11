import express, { Request, Response, NextFunction } from "express"
import { AppDataSource } from "./data-source"
import { Routes } from "./routes"
import { zodValidate } from "./util/validationFormatters"
import dotenv from "dotenv"

dotenv.config()

AppDataSource.initialize().then(async () => {
    // create express app
    const app = express()
    app.use(express.json())

    // register express routes from defined application routes
    Routes.forEach(route => {
        (app as any)[route.method](
            route.route,
            zodValidate(route.validator as any),
            (req: Request, res: Response, next: Function) => {
                const result = (new (route.controller as any))[route.action](req, res, next)
                if (result instanceof Promise) {
                    result.then(result =>
                        result !== null && result !== undefined
                            ? res.send(result)
                            : undefined
                    )
                } else if (result !== null && result !== undefined) {
                    res.json(result)
                }
            })
    })

    // start express server
    app.listen(process.env.PORT)

    console.log("Darkflare backend up on port 3000.")

}).catch(error => console.log(error))
