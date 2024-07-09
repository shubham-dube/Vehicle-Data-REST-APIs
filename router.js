const router = require("express").Router();
const controller = require("./controller/controller.js");

router.post("/signInWithMobile", controller.SignInMobile);
router.post("/submitOtp", controller.submitOtp);

router.post("/changeServer", controller.changeServer);
router.post("/dispose", controller.dispose);

router.post("/getVehicleDetails", controller.getVehicleDetail);

module.exports = router;