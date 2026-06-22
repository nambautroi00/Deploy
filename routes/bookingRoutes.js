const express = require("express");

const bookingController = require("../controllers/bookingController");

const router = express.Router();

router.get("/", bookingController.getAllBookings);
router.post("/", bookingController.createBooking);
router.put("/:bookingId", bookingController.updateBooking);
router.delete("/:bookingId", bookingController.deleteBooking);

module.exports = router;
