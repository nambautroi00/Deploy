const express = require("express");
const passport = require("passport");

const router = express.Router();

// Check if Google OAuth is configured
const isGoogleConfigured = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  return (
    clientId &&
    clientSecret &&
    clientId !== "your_google_client_id_here" &&
    clientSecret !== "your_google_client_secret_here"
  );
};

// Google OAuth login route
router.get("/google", (req, res, next) => {
  if (!isGoogleConfigured()) {
    return res.status(500).send(
      "Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env file.",
    );
  }
  passport.authenticate("google", { scope: ["profile", "email"] })(
    req,
    res,
    next,
  );
});

// Google OAuth callback route (Express 5 compatible)
router.get("/google/callback", (req, res, next) => {
  if (!isGoogleConfigured()) {
    return res.status(500).send(
      "Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env file.",
    );
  }

  // Use custom callback instead of middleware to avoid Express 5 compatibility issues
  passport.authenticate("google", (err, user, info) => {
    if (err) {
      console.error("Google auth error:", err);
      return res.redirect("/login?error=auth_failed");
    }
    if (!user) {
      return res.redirect("/login?error=auth_failed");
    }

    // Manually log the user in
    req.login(user, (loginErr) => {
      if (loginErr) {
        console.error("Login error:", loginErr);
        return res.redirect("/login?error=auth_failed");
      }
      return res.redirect("/");
    });
  })(req, res, next);
});

// Logout route (Express 5 compatible)
router.get("/logout", (req, res, next) => {
  if (typeof req.logout === "function" && req.logout.length >= 1) {
    // Express 5 / Passport 0.7+ (callback-based)
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy(() => {
        res.redirect("/login");
      });
    });
  } else {
    // Fallback
    try {
      req.logout();
    } catch (_) {}
    req.session.destroy(() => {
      res.redirect("/login");
    });
  }
});

module.exports = router;