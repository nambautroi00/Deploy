require("dotenv").config();
const express = require("express");

const connectDB = require("./config/db");
const carRoutes = require("./routes/carRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const pageRoutes = require("./routes/pageRoutes");

const app = express();

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", pageRoutes);
app.use("/cars", carRoutes);
app.use("/bookings", bookingRoutes);

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Car rental server running on port ${PORT}`);
  });
});
