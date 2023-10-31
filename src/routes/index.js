const express = require("express");
const router = express.Router();
const middlewares = require("../middleware");
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");
const paymentController = require("../controllers/payment.controller");
const fileController = require("../controllers/file.controller");
const adminController = require("../controllers/admin.controller");
const donationController = require("../controllers/donation.controller");
const feedbackController = require("../controllers/feedback.controller");
const stripeController = require("../controllers/stripe.controller");

router.post("/auth/signup", authController.signup)
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

//avatar
router.post("/avatar", middlewares.authJwt.verifyToken, fileController.upload, fileController.fileHandle);
router.get("/avatar/:fileName", fileController.getFile);
router.delete("/avatar/:fileName",middlewares.authJwt.isAdmin, fileController.delete);

//Donation
router.get("/donation", middlewares.authJwt.verifyToken, donationController.findAll)
router.get("/donation/:id",middlewares.authJwt.verifyToken, donationController.findOne);
router.post("/donation", middlewares.authJwt.verifyToken, donationController.create)
router.put("/donation/:id", middlewares.authJwt.verifyToken, donationController.update)
router.delete("/donation/:id",middlewares.authJwt.isAdmin, donationController.delete);
router.put("/donation/approve/:id", middlewares.authJwt.isAdmin, donationController.approve);


router.post("/pay/stripe", stripeController.createCharge);

//Feedback
router.get("/feedback", middlewares.authJwt.verifyToken, feedbackController.findAll)
router.post("/feedback", middlewares.authJwt.verifyToken, feedbackController.create)

//Payment
router.post("/payment/stripe", middlewares.authJwt.verifyToken, paymentController.payWithStripe);
router.post("/payment/paypal", middlewares.authJwt.verifyToken, paymentController.payWithPaypal);
router.post("/payment/cofirm/stripe", middlewares.authJwt.verifyToken, paymentController.confirmPaypalPayment);

router.get("/admin/db/drop", [middlewares.authJwt.verifyToken, middlewares.authJwt.isAdmin], adminController.drop)

module.exports = router;
