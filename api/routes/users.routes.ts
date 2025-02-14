import { Router } from "express";
const router = Router();
import { UsersControllers } from "../controllers/users.controllers";
import { validateAuth } from "../middlewares/auth";
import { validateAuthAdmin } from "../middlewares/validateAuthAdmin";

router.get("/", validateAuthAdmin, UsersControllers.getAllUsers);

router.get(
  "/number-of-deliverymen-and-enabled-deliverymen",
  validateAuthAdmin,
  UsersControllers.GetNumberOfDeliverymenAndEnadledDeliverymen
);

router.post("/register", UsersControllers.registerUser);

router.put("/confirm-email/:token", UsersControllers.confirmEmail);

router.post("/resend-confirmation-email/:token", UsersControllers.resendEmail);

router.post("/login", UsersControllers.loginUser);

router.get("/deliverymen", validateAuthAdmin, UsersControllers.getDeliverymen);

router.get(
  "/deliverymen-with-packages-quantity-by-date/:date",
  validateAuthAdmin,
  UsersControllers.getDeliverymenWithPackagesQuantityByDate
);

router.get("/single/:id", validateAuthAdmin, UsersControllers.getUser);

router.delete(
  "/delete/deliveryman",
  validateAuthAdmin,
  UsersControllers.deleteDeliveryman
);

router.delete("/delete/admin", validateAuthAdmin, UsersControllers.deleteAdmin);

router.post("/logout", UsersControllers.logout);

router.put("/restore-password", UsersControllers.sendEmail);

router.get(
  "/validate-token/:token",
  UsersControllers.validateTokenToRestorePassword
);

router.put("/overwrite-password/:token", UsersControllers.overwritePassword);

router.get("/me", validateAuth, UsersControllers.me);

router.put(
  "/enable-deliveryman/:id",
  validateAuth,
  UsersControllers.enableDeliveryman
);

router.put(
  "/disable-deliveryman/:id",
  validateAuth,
  UsersControllers.disableDeliveryman
);

// endpoints for testing
router.delete("/delete/deliveryman/test", UsersControllers.deleteDeliveryman);
router.get("/single-by-email/:email", UsersControllers.getUserByEmail);

export default router;
