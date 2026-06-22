const mongoose = require("mongoose");
const Booking = require("../models/bookingModel");
const Car = require("../models/carModel");

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const calculateRentalDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / MS_PER_DAY),
  );
};

const hasBookingConflict = async (carNumber, startDate, endDate, bookingId) => {
  const conflictFilter = {
    carNumber,
    startDate: { $lt: endDate },
    endDate: { $gt: startDate },
  };

  if (bookingId) {
    conflictFilter._id = { $ne: bookingId };
  }

  const conflictingBooking = await Booking.findOne(conflictFilter);
  return Boolean(conflictingBooking);
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { customerName, carNumber, startDate, endDate } = req.body;

    if (!customerName || !carNumber || !startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "All booking fields are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid booking dates" });
    }

    if (end <= start) {
      return res
        .status(400)
        .json({ message: "endDate must be after startDate" });
    }

    const car = await Car.findOne({ carNumber });
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    if (await hasBookingConflict(carNumber, start, end)) {
      return res.status(409).json({ message: "Booking conflict for this car" });
    }

    const rentalDays = calculateRentalDays(start, end);
    const totalAmount = rentalDays * car.pricePerDay;

    const booking = await Booking.create({
      customerName,
      carNumber,
      startDate: start,
      endDate: end,
      totalAmount,
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "Invalid bookingId" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const nextCustomerName = req.body.customerName ?? booking.customerName;
    const nextCarNumber = req.body.carNumber ?? booking.carNumber;
    const nextStartDate = req.body.startDate
      ? new Date(req.body.startDate)
      : booking.startDate;
    const nextEndDate = req.body.endDate
      ? new Date(req.body.endDate)
      : booking.endDate;

    if (
      Number.isNaN(nextStartDate.getTime()) ||
      Number.isNaN(nextEndDate.getTime())
    ) {
      return res.status(400).json({ message: "Invalid booking dates" });
    }

    if (nextEndDate <= nextStartDate) {
      return res
        .status(400)
        .json({ message: "endDate must be after startDate" });
    }

    const car = await Car.findOne({ carNumber: nextCarNumber });
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    if (
      await hasBookingConflict(
        nextCarNumber,
        nextStartDate,
        nextEndDate,
        bookingId,
      )
    ) {
      return res.status(409).json({ message: "Booking conflict for this car" });
    }

    const rentalDays = calculateRentalDays(nextStartDate, nextEndDate);
    const totalAmount = rentalDays * car.pricePerDay;

    booking.customerName = nextCustomerName;
    booking.carNumber = nextCarNumber;
    booking.startDate = nextStartDate;
    booking.endDate = nextEndDate;
    booking.totalAmount = totalAmount;

    await booking.save();

    res.status(200).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "Invalid bookingId" });
    }

    const deletedBooking = await Booking.findByIdAndDelete(bookingId);
    if (!deletedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
