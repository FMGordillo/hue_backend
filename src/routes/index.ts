import express, { NextFunction, Request, Response } from "express";
import { v3 } from "node-hue-api";

const LightState = v3.lightStates.LightState;
// Replace with your actual username and IP address
const USERNAME = "your-username";
const IP_ADDRESS = "192.168.1.39";

const router = express.Router();

/* GET home page. */
router.get("/", function (req: Request, res: Response, next: NextFunction) {
  res.send("Hello world");
});

export default router;
