require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Publication = require('../models/Publication');
const jwtSecret = process.env.JWT_SECRET;

const requireAuth = (roles) => (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, jwtSecret, async (err, decodedToken) => {
      if (err) {
        res.redirect("/login");
      } else {
        const user = await User.findById(decodedToken.id);
        if (roles.includes(user.role)) {
          next();
        } else {
          res.status(401).send("Vous n'avez pas les droits nécessaires pour accéder à cette page");
        }
      }
    });
  } else {
    res.redirect("/login");
  }
};
// Middleware pour vérifier si l'utilisateur est un administrateur
const requireAdmin = async (req, res, next) => {
  
  if (!req.userId) return res.redirect("/login");  // S'assurer que l'utilisateur est authentifié

  try {
    const user = await User.findById(req.userId);
    if (user && user.role === "administrator") {
      next();
    } else {
      res.status(403).send("Access denied. Admins only.");
    }
  } catch (error) {
    console.error("Admin check failed:", error);
    res.status(500).send("Internal server error");
  }
};

// check current user
const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, jwtSecret, async (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.locals.user = null;
        next();
      } else {
        let user = await User.findById(decodedToken.id);
        res.locals.user = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};



module.exports = { requireAuth, requireAdmin, checkUser };




