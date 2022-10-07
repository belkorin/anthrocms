import express, { Express, Request, Response } from 'express';

// Instantiating the Express object.
const app: Express = express();

// Handles whenever the root directory of the website is accessed.
app.get("/", function(req: Request, res: Response) {
  // Respond with Express
  res.send("Hello world! Stay a while and listen!");
});

// Set app to listen on port 3000
app.listen(3000, function() {
    console.log("server is running on port 3000");
});