import express from "express";
const router = express.Router();
import verifyToken from "../controllers/users.controllers";
import dotenv from "dotenv";
dotenv.config();

import users from "./users.routes";
import packages from "./packages.routes";
import value from "./value.routes";

router.use("/users", users);
router.use("/packages", packages);
router.use("/value", value);

router.get("/private", verifyToken, (_req, res) =>
  res.send({ message: "Hello World! This is a private route." })
);

export default router;
