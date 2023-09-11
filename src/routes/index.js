const express = require("express");
const router = express.Router();
const middlewares = require("../middleware");
const stripPaymentController = require("../controllers/StripPayment.controller");
const PayPalPaymentController = require("../controllers/PaypalPayment.controller");
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");
const cryptoPaymentController = require("../controllers/cryptoPayment.controller");
const transactionController = require("../controllers/transactionPayment.controller");
const fileController = require("../controllers/file.controller");
const adminController = require("../controllers/admin.controller");

router.post("/auth/signup", [middlewares.verifySignUp.checkRolesExisted], authController.signup)
router.post("/auth/signin", authController.signin)
router.post("/auth/signout", authController.signout)
router.get("/auth/verifyEmail/:id/:token", authController.verifyEmail)
router.get("/auth/verifyPhoneNumber/:id/:token", authController.verifyPhoneNumber)
router.post("/auth/forgot", authController.forgot)
router.get("/auth/requestEmailVerify", middlewares.authJwt.verifyToken, authController.requestEmailVerify)
router.get("/auth/requestPhoneVerify", middlewares.authJwt.verifyToken, authController.requestPhoneVerify)
router.get("/auth/rest/:token", authController.reset)
router.put("/auth/rest", authController.changePassword)

router.get("/user", middlewares.authJwt.verifyToken, userController.allUsers);
router.get("/user/check-verification", middlewares.authJwt.verifyToken, userController.checkVerification);
router.get("/user/:id([0-9]+)", [middlewares.authJwt.verifyToken, middlewares.authJwt.isAdmin], userController.getUser);
router.put("/user", middlewares.authJwt.verifyToken, userController.update);
router.delete("/user/:id([0-9]+)", [middlewares.authJwt.verifyToken, middlewares.authJwt.isAdmin], userController.delete);
router.get("/dashboard", [middlewares.authJwt.verifyToken], userController.dashboard);
router.get("/payment-info", [middlewares.authJwt.verifyToken], userController.getpaymentinfo);
router.post("/withdraw", [middlewares.authJwt.verifyToken], userController.withdraw);

//avatar
router.post("/avatar", middlewares.authJwt.verifyToken, fileController.upload, fileController.fileHandle);
router.get("/avatar/:fileName", fileController.getFile);
router.delete("/avatar/:fileName",middlewares.authJwt.isAdmin, fileController.delete);

//Transaction
router.get("/transaction", middlewares.authJwt.verifyToken, transactionController.index)

//Crypto Payment
router.post("/crypto/payment", middlewares.authJwt.verifyToken, cryptoPaymentController.payment)

//Strip Payment
router.get("/stripe", middlewares.authJwt.verifyToken, stripPaymentController.index);
router.post("/stripe/payment", middlewares.authJwt.verifyToken, stripPaymentController.payment);

// Paypal Payment
router.post("/paypal/payment", middlewares.authJwt.verifyToken, PayPalPaymentController.payment);


router.get("/admin/db/drop", [middlewares.authJwt.verifyToken, middlewares.authJwt.isAdmin], adminController.drop)

module.exports = router;
