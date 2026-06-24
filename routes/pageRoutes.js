const express = require("express");
const mongoose = require("mongoose");

const Booking = require("../models/bookingModel");
const Car = require("../models/carModel");

const router = express.Router();

// Auth middleware - redirects to login if not authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

// Login page
router.get("/login", (req, res) => {
  // If already logged in, redirect to home
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.redirect("/");
  }
  res.render("login");
});

// Dashboard (protected)
router.get("/", ensureAuthenticated, async (req, res) => {
  const cars = await Car.find().sort({ createdAt: -1 });
  const bookings = await Booking.find().sort({ createdAt: -1 });

  res.render("index", { cars, bookings, user: req.user });
});

// Car form pages (protected)
router.get("/cars/new", ensureAuthenticated, (req, res) => {
  res.render("car-form", { user: req.user });
});

router.get("/cars/:carNumber/edit", ensureAuthenticated, async (req, res) => {
  const { carNumber } = req.params;

  const car = await Car.findOne({ carNumber });
  if (!car) {
    return res.status(404).send("Car not found");
  }

  res.render("car-edit", { car, user: req.user });
});

// Booking form pages (protected)
router.get("/bookings/new", ensureAuthenticated, async (req, res) => {
  const cars = await Car.find().sort({ carNumber: 1 });
  res.render("booking-form", { cars, user: req.user });
});

router.get("/bookings/:bookingId/edit", ensureAuthenticated, async (req, res) => {
  const { bookingId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    return res.status(400).send("Invalid booking ID");
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return res.status(404).send("Booking not found");
  }

  const cars = await Car.find().sort({ carNumber: 1 });
  res.render("booking-edit", { booking, cars, user: req.user });
});

module.exports = router;
