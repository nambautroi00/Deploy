const Car = require("../models/carModel");
const fs = require("fs");
const path = require("path");

exports.getAllCars = async (req, res) => {
  try {
    const cars = await Car.find().sort({ createdAt: -1 });
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCar = async (req, res) => {
  try {
    const carData = { ...req.body };

    // Handle features array from FormData
    if (carData.features && typeof carData.features === "object") {
      carData.features = Object.values(carData.features).filter(Boolean);
    }

    if (req.file) {
      carData.image = "/uploads/" + req.file.filename;
    }
    const car = await Car.create(carData);
    res.status(201).json(car);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getCarByNumber = async (req, res) => {
  try {
    const { carNumber } = req.params;
    const car = await Car.findOne({ carNumber });

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.status(200).json(car);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCar = async (req, res) => {
  try {
    const { carNumber } = req.params;
    const car = await Car.findOne({ carNumber });

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    let { carNumber: newCarNumber, capacity, status, pricePerDay, features } = req.body;

    // Handle features array from FormData
    if (features && typeof features === "object" && !Array.isArray(features)) {
      features = Object.values(features).filter(Boolean);
    }

    if (newCarNumber && newCarNumber !== carNumber) {
      const existing = await Car.findOne({ carNumber: newCarNumber });
      if (existing) {
        return res.status(409).json({ message: "Car number already exists" });
      }
    }

    if (newCarNumber !== undefined) car.carNumber = newCarNumber;
    if (capacity !== undefined) car.capacity = capacity;
    if (status !== undefined) car.status = status;
    if (pricePerDay !== undefined) car.pricePerDay = pricePerDay;
    if (features !== undefined) car.features = features;

    // Handle image upload
    if (req.file) {
      // Delete old image if it exists
      if (car.image) {
        const oldPath = path.join(__dirname, "..", car.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      car.image = "/uploads/" + req.file.filename;
    }

    await car.save();

    res.status(200).json(car);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteCar = async (req, res) => {
  try {
    const { carNumber } = req.params;
    const car = await Car.findOneAndDelete({ carNumber });

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    // Delete associated image if it exists
    if (car.image) {
      const imagePath = path.join(__dirname, "..", car.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.status(200).json({ message: "Car deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};