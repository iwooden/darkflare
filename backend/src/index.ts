import express, { Request, Response, NextFunction } from "express"
import { AppDataSource } from "./data-source"
import { Routes } from "./routes"

// Generic Zod validator middleware
const validate = (schema: any) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (schema) {
                await schema.parseAsync({
                    body: req.body,
                    query: req.query,
                    params: req.params,
                })
            }
            return next();
        } catch (error) {
            return res.status(400).json(error);
        }
    };

AppDataSource.initialize().then(async () => {
    // create express app
    const app = express()
    app.use(express.json())

    // register express routes from defined application routes
    Routes.forEach(route => {
        (app as any)[route.method](
            route.route,
            validate(route.validator as any),
            (req: Request, res: Response, next: Function) => {
                const result = (new (route.controller as any))[route.action](req, res, next)
                if (result instanceof Promise) {
                    result.then(result => result !== null && result !== undefined ? res.send(result) : undefined)
                } else if (result !== null && result !== undefined) {
                    res.json(result)
                }
            })
    })

    // start express server
    app.listen(3000)

    console.log("Darkflare backend up on port 3000.")

}).catch(error => console.log(error))
