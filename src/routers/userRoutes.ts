import { Router } from "express";

import { deleteUser, getAllUsers, getUser, updateUser } from "../controllers/userController";
import { protect } from "../middleware/authMiddleware";
import { UpdateUserSchema, validateSchema } from "../middleware/validateSchema";

const router = Router();


router.route("/").get(protect, getAllUsers);
router.route("/:id").get(protect, getUser);
router.route("/:id").put(protect, validateSchema(UpdateUserSchema), updateUser);
router.route("/:id").delete(protect, deleteUser);


export default router;
