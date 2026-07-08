import express from "express";
import { getCurrentUser } from "../Controllers/User.controller.js";
import isAuth from "../middlewares/isAuth.js";

const userrouter = express.Router();

userrouter.get("/me", isAuth, getCurrentUser);

export default userrouter;
