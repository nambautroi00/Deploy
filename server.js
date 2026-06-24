require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("./config/passport");

const connectDB = require("./config/db");
const carRoutes = require("./routes/carRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const pageRoutes = require("./routes/pageRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Express session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "carRentalSecretKey2026",
    resave: false,
    saveUninitialized: false,
  }),
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Make user available to all views
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

app.use("/", pageRoutes);
app.use("/cars", carRoutes);
app.use("/bookings", bookingRoutes);
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Car rental server running on port ${PORT}`);
  });
});
