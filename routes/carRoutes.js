const express = require("express");

const carController = require("../controllers/carController");
const upload = require("../middleware/upload");

const router = express.Router();

router.get("/", carController.getAllCars);
router.post("/", upload.single("image"), carController.createCar);
router.get("/:carNumber", carController.getCarByNumber);
router.put("/:carNumber", upload.single("image"), carController.updateCar);
router.delete("/:carNumber", carController.deleteCar);

module.exports = router;
