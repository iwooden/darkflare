import express, { Request, Response } from 'express';
const app = express();

// database connections

// routes
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

// some more stuff

const APP_PORT = 3000;

app.listen(APP_PORT, () => {
  console.log(`Server started on port ${APP_PORT}`);
});

// end
