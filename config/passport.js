const passport = require("passport");
const User = require("../models/userModel");

// Only configure Google Strategy if credentials are provided
const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

const isGoogleConfigured =
  clientID &&
  clientSecret &&
  clientID !== "your_google_client_id_here" &&
  clientSecret !== "your_google_client_secret_here";

if (isGoogleConfigured) {
  const GoogleStrategy = require("passport-google-oauth20").Strategy;

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL ||
          "http://localhost:4000/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            // Create new user
            user = await User.create({
              googleId: profile.id,
              displayName: profile.displayName,
              email: profile.emails?.[0]?.value || "",
              avatar: profile.photos?.[0]?.value || "",
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      },
    ),
  );
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
