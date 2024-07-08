const router = require("express").Router();
const controller = require("./controller.js");

router.post("/signInWithMobile", controller.SignInMobile);
router.post("/submitOtp", controller.submitOtp);

router.post("/changeServer", controller.changeServer);

// router.post("/selectState", controller.selectState);
// router.post("/getChallanDetails", controller.getChallanDetails);
// router.post("/getCaptcha", controller.getCaptcha);

router.post("/getVehicleDetails", controller.getVehicleDetail);

module.exports = router;