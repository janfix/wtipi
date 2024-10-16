require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require("multer");
const fs = require("fs");
const fsExtra = require("fs-extra"); 
const csv = require("csv-parser"); 
const { checkUser, requireAuth, requireAdmin,  requireAuthInPublication,requireAuthForStaticFiles } = require("./middleware/authMiddleware");
const User = require("./models/User");
const Test = require("./models/Test");
const Group = require("./models/group");
const jwt = require("jsonwebtoken");
const AdmZip = require("adm-zip");
const blogRoutes = require("./routes/blogRoutes");
const testRoutes = require("./routes/testRoutes");
const groupRoutes = require("./routes/groupRoutes");
const authRoutes = require("./routes/authRoutes");
const publicationRoutes = require("./routes/publicationRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");
const resultRoutes = require('./routes/resultsRoute');
const parameterRoutes = require('./routes/parameterRoutes');





const app = express();

// Configuration de Multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB
});
const uploadcsv = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB
});



const dbURI = process.env.DB_URI;


app.use(cookieParser());
app.use(bodyParser.text({ type: 'application/xml' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Configuration des sessions
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.IS_HTTPS === 'true'
  }
}));

app.post('/set_session', (req, res) => {
  const testCode = req.body.testCode;
  const studentCode = req.body.studentCode;
 const publicationCode = req.body.publicationCode;
  if (!testCode || !studentCode || !publicationCode) {
    return res.status(400).send('Test code or student code or publication code is missing');
  }

  req.session.testCode = testCode;
  req.session.studentCode = studentCode;
  req.session.publicationCode = publicationCode;
  res.json({ success: true });
});




// Connect to MongoDB
mongoose
  .connect(dbURI)
  .then(() => app.listen(3000, () => console.log("**********  Serveur démarré sur http://localhost:3000  ************")))
  .catch((err) => console.log(err));

// Set view engine
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));
app.use('/wtipiTests', express.static('wtipiTests'));


app.use('/wtipiPubs', express.static('wtipiPubs'));
// Middleware pour protéger les fichiers statiques
//app.use('/wtipiPubs/test/:publicationCode/:publicationId*', requireAuthForStaticFiles, express.static(path.join(__dirname, 'wtipiPubs')));

// Application routes with middleware checks
app.use("/tests", (req, res, next) => {
  res.locals.currentPage = 'tests';
  next();
}, testRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware to set the current page
app.use((req, res, next) => {
  res.locals.currentPage = 'about';
  next();
});

app.use(checkUser);

// Route pour télécharger le CSV
app.post("/uploadcsv", uploadcsv.single("csvfile"), async (req, res) => {
  const activGroup = req.body.activGroup; // ID du groupe actif en MongoDB
  if (!req.file) {
    return res.status(400).send("Aucun fichier fourni.");
  }

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv({ separator: ',' }))
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        for (let user of results) {
          let existingUser = await User.findOne({ email: user.email });
          if (existingUser) {
            // Ajoutez l'ID de l'utilisateur au groupe, s'il n'est pas déjà présent
            const groupUpdate = await Group.findByIdAndUpdate(activGroup, { $addToSet: { students: existingUser._id } }, { new: true });
            if (!existingUser.group.includes(activGroup)) {
              existingUser.group.push(activGroup);
              await existingUser.save();
            }
          } else {
            // Créez un nouvel utilisateur et ajoutez-le au groupe
            const newUser = new User({
              firstname: user.firstname,
              lastname: user.lastname,
              email: user.email,
              role: "student",
              password: user.password,
              group: [activGroup],
              SID: user.id,
              school : user.school,
              town : user.town,
              sector : user.sector,
              grade : user.grade,
              zipcode : user.zipcode,
              mailStatus : user.mailStatus
            });
            const savedUser = await newUser.save();
            const groupUpdate = await Group.findByIdAndUpdate(activGroup, { $push: { students: savedUser._id } }, { new: true });
          }
        }
        res.send("Utilisateurs importés avec succès.");
      } catch (error) {
        console.error("Erreur lors de l'enregistrement des utilisateurs : ", error);
        res.status(500).send("Erreur lors de l'importation des utilisateurs.");
      }
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Erreur lors de la suppression du fichier temporaire", err);
      });
    });
});




// Routes API accessibles sans authentification FINI ça ??? Verif
app.get('/api/tests', async (req, res) => {
  try {
    const tests = await Test.find();
    res.json(tests);
  } catch (error) {
    console.error("Database access error:", error);
    res.status(500).send("Failed to get tests");
  }
});

app.get('/api/groups', async (req, res) => {
  console.log('Route /api/groups atteinte');
  try {
    const groups = await Group.find();
    res.json(groups);
  } catch (error) {
    console.error("Database access error:", error);
    res.status(500).send("Failed to get groups");
  }
});

// Page d'accueil
app.get("/", (req, res) => {
  res.redirect("/about");
});

app.get("/about", (req, res) => {
  res.render("about", { title: "About", currentPage: 'about' });
});


app.use(assessmentRoutes);

app.use("/assessments", (req, res, next) => {
  console.log('Middleware /assessments, URL demandée :', req.url);
  res.locals.currentPage = 'assessments';
  next();
}, assessmentRoutes);

app.use(resultRoutes)


app.use("/blogs", (req, res, next) => {
  res.locals.currentPage = 'blogs';
  next();
}, blogRoutes);

app.use("/parameters", (req, res, next) => {
  res.locals.currentPage = 'parameters';
  next();
}, parameterRoutes);

app.use("/register", (req, res, next) => {
  res.locals.currentPage = 'register';
  next();
}, authRoutes);

app.use("/groups", (req, res, next) => {
  res.locals.currentPage = 'groups';
  next();
}, groupRoutes);

app.use("/publications", (req, res, next) => {
  res.locals.currentPage = 'publications';
  next();
}, publicationRoutes);

app.use(authRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render("404", { title: "404" });
});

