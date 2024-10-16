require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Publication = require('../models/Publication');
const jwtSecret = process.env.JWT_SECRET;
const { ObjectId } = require('mongodb');

const requireAuth = (roles) => (req, res, next) => {
 
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        console.log("JWT verification error:", err);
        res.redirect("/login");
      } else {
        try {
          const user = await User.findById(decodedToken.id);
          //console.log(user)
          if (user && roles.includes(user.role)) {
            req.userId = user._id;  // Ajout de l'ID utilisateur au `req`
            res.locals.user = user;
            next();
          } else {
            res.status(401).send("Vous n'avez pas les droits nécessaires pour accéder à cette page");
          }
        } catch (error) {
          console.log("Error fetching user:", error);
          res.status(500).send("Internal server error");
        }
      }
    });
  } else {
    console.log("No token found");
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

const requireAuthInPublication = async (req, res, next) => {
  console.log("MIDDLEWARE : requireAuthInPublication");
  console.log("Params in middleware:", req.params);

  const token = req.cookies.jwt;
  if (!token) {
    console.log('No token found, redirecting to login.');
    return res.redirect("/login");
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
    if (err) {
      console.log('Token verification failed:', err.message);
      return res.redirect("/login");
    } else {
      req.userId = decodedToken.id;
      const user = await User.findById(req.userId);
      if (!user) {
        console.log('User not found for ID:', req.userId);
        return res.status(404).send("User not found.");
      }

      req.session.loggedIn = true;
      req.session.authTest = user.testAuth || [];

      const isAdmin = user.role === 'administrator';
      const publicationId = req.params.publicationId;

      if (!publicationId) {
        console.log('No publicationId found in request parameters.');
        return res.redirect("/login");
      }

      console.log('Checking publication for user:', req.userId, 'and publicationId:', publicationId);
      const isStudentInPublication = await Publication.findOne({ _id: new ObjectId(publicationId), students: req.userId });

      console.log('isStudentInPublication:', isStudentInPublication);

      if (req.session.loggedIn && (isAdmin || isStudentInPublication)) {
        return next();
      } else {
        console.log("User is not authorized, redirecting to login.");
        return res.redirect("/login");
      }
    }
  });
};



const requireAuthForStaticFiles = async (req, res, next) => {
  console.log("MIDDLEWARE : requireAuthForStaticFiles");
  console.log("Params in middleware:", req.params);

  const token = req.cookies.jwt;
  if (!token) {
    console.log('No token found, redirecting to login.');
    return res.redirect("/login");
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
    if (err) {
      console.log('Token verification failed:', err.message);
      return res.redirect("/login");
    } else {
      req.userId = decodedToken.id;
      const user = await User.findById(req.userId);
      if (!user) {
        console.log('User not found for ID:', req.userId);
        return res.status(404).send("User not found.");
      }

      req.session.loggedIn = true;
      req.session.authTest = user.testAuth || [];

      const isAdmin = user.role === 'administrator';
      const publicationId = req.params.publicationId;

      if (!publicationId || !ObjectId.isValid(publicationId)) {
        console.log('No valid publicationId found in request parameters.');
        return res.redirect("/login");
      }

      console.log('Checking publication for user:', req.userId, 'and publicationId:', publicationId);
      const isStudentInPublication = await Publication.findOne({ _id: new ObjectId(publicationId), students: req.userId });

      console.log('isStudentInPublication:', isStudentInPublication);

      if (req.session.loggedIn && (isAdmin || isStudentInPublication)) {
        return next();
      } else {
        console.log("User is not authorized, redirecting to login.");
        return res.redirect("/login");
      }
    }
  });
};





module.exports = { 
  requireAuth, 
  requireAdmin, 
  checkUser, 
  requireAuthInPublication,
  requireAuthForStaticFiles 
};




