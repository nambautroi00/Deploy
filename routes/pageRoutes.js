const express = require("express");
const mongoose = require("mongoose");

const Booking = require("../models/bookingModel");
const Car = require("../models/carModel");

const router = express.Router();

router.get("/", async (req, res) => {
  const cars = await Car.find().sort({ createdAt: -1 });
  const bookings = await Booking.find().sort({ createdAt: -1 });

  res.render("index", { cars, bookings });
});

router.get("/cars/new", (req, res) => {
  res.render("car-form");
});

router.get("/cars/:carNumber/edit", async (req, res) => {
  const { carNumber } = req.params;

  const car = await Car.findOne({ carNumber });
  if (!car) {
    return res.status(404).send("Car not found");
  }

  res.render("car-edit", { car });
});

router.get("/bookings/new", async (req, res) => {
  const cars = await Car.find().sort({ carNumber: 1 });
  res.render("booking-form", { cars });
});

router.get("/bookings/:bookingId/edit", async (req, res) => {
  const { bookingId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    return res.status(400).send("Invalid booking ID");
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return res.status(404).send("Booking not found");
  }

  const cars = await Car.find().sort({ carNumber: 1 });
  res.render("booking-edit", { booking, cars });
});

module.exports = router;