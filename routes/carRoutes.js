const express = require("express");

const carController = require("../controllers/carController");

const router = express.Router();

router.get("/", carController.getAllCars);
router.post("/", carController.createCar);
router.get("/:carNumber", carController.getCarByNumber);
router.put("/:carNumber", carController.updateCar);
router.delete("/:carNumber", carController.deleteCar);

module.exports = router;