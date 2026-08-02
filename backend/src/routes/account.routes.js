import express from "express";

import { authenticate } from "../middleware/authenticate.js";

import {
  deleteAccountController
} from "../controllers/account.controller.js";

const router = express.Router();

router.delete(
  "/",
  authenticate,
  deleteAccountController
);

export default router;