require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const blogRoutes = require("./routes/blogRoutes");
const testRoutes = require("./routes/testRoutes");
const groupRoutes = require("./routes/groupRoutes");
const authRoutes = require("./routes/authRoutes");
const publicationRoutes = require("./routes/publicationRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const AdmZip = require("adm-zip");
const fs = require("fs");
const path = require("path");
const { checkUser } = require("./middleware/authMiddleware");
const app = express();
const upload = multer({ dest: 'upload/' });
const uploadcsv = multer({ dest: 'uploadcsv/' });
const dbURI = process.env.DB_URI;
const csv = require('csv-parser');
const Group = require("./models/group")
const User = require("./models/User");
const Test = require("./models/Test");
const Assessment = require("./models/Assessment");
const session = require('express-session');

app.use(session({
    secret: process.env.SESSION_SECRET, // Utilisez une chaîne secrète pour signer l'ID de session.
    resave: false, // Ne pas resauvegarder la session si elle n'a pas été modifiée.
    saveUninitialized: false, // Ne pas sauvegarder une session qui est nouvelle et non modifiée.
    cookie: {
      secure: process.env.IS_HTTPS === 'true' // Convertir en booléen
    } // `true` si vous êtes en HTTPS, false sinon. ICI C'est false car en dev
}));


mongoose
  .connect(dbURI)
  .then((result) => app.listen(3000))
  .catch((err) => console.log(err));

app.set("view engine", "ejs");

//app.use(express.static("public"));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/wtipiTests', express.static('wtipiTests'));


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req, res, next) => {
  res.locals.currentPage = 'about'; // Vous pouvez mettre une valeur par défaut ici
  next();
});


// Insérer ici la vérification de l'utilisateur pour toutes les routes
app.use(checkUser);


app.get("/", (req, res) => {
  res.redirect("/about");
});

app.get("/about", (req, res) => {
  res.render("about", { title: "About", currentPage: 'about' });
});

//Route API 1 pour obtenir les listes des tests, groupes et publications

app.get('/api/tests', async (req, res) => {
  try {
    const tests = await Test.find();
    res.json(tests);
  } catch (error) {
    console.error("Database access error:", error); // This will log the detailed error
    res.status(500).send("Failed to get tests");
  }
});

app.get('/api/groups', async (req, res) => {
  try {
    const groups = await Group.find(); // Assuming 'Group' is your Mongoose model for groups
    res.json(groups);
  } catch (error) {
    res.status(500).send("Failed to get groups");
  }
});

//Reach Test Preview





//Route pour télécharger le CSV
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
              password:user.password, 
              group: [activGroup],
              SID: user.id
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




// Route pour télécharger le fichier ZIP
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    console.log('Route /upload atteinte');
    return res.status(400).send('No file uploaded.');
  } else {
    const uniCode = req.body.IDcode;
    const uniq = "test" + uniCode;
    console.log(uniCode)
    try {
      // Chemin où le fichier ZIP téléchargé est temporairement stocké
      const tempPath = req.file.path;
      var testurl;
      console.log("ZIP TREATMENT");
      const zip = new AdmZip(tempPath);

      // Extraction du contenu du ZIP en préservant la structure des répertoires
      zip.extractAllTo(/*target path*/'wtipiTests/' + uniq, /*overwrite*/true);

      try {
        // Enregistrement du chemin du fichier dans la base de données
        testurl = 'wtipiTests/' + uniq;
        const existingTest = await Test.findOne({ uniCode: uniCode });
        if (existingTest) {
          await Test.findOneAndUpdate({ uniCode: uniCode }, { testpath: testurl }, { new: true });
        } else {
          console.log("Aucun test correspondant trouvé pour ce uniCode");
          // Gérer l'absence de document ici, peut-être en renvoyant une erreur ou en informant l'utilisateur
        }


        res.send("Fichier uploadé et chemin enregistré !");
      } catch (error) {
        console.error("Erreur d'enregistrement dans MongoDB:", error);
        res.status(500).send("Erreur du serveur.");
      }
    } catch (error) {
      console.log(error);
      res.status(500).send('Server error.');
    }
  }
});

app.use("/tests", (req, res, next) => {
  res.locals.currentPage = 'tests'; // `res.locals` rend la variable disponible dans toutes les vues
  next();
},testRoutes);

app.use("/assessments",(req, res, next) => {
  res.locals.currentPage = 'assessments';
  next();
}, assessmentRoutes);

app.use("/blogs",(req, res, next) => {
  res.locals.currentPage = 'blogs';
  next();
}, blogRoutes);

app.use("/groups",(req, res, next) => {
  res.locals.currentPage = 'groups';
  next();
}, groupRoutes);

app.use("/publications",(req, res, next) => {
  res.locals.currentPage = 'publications';
  next();
}, publicationRoutes);

app.use(authRoutes);

app.use((req, res) => {
  res.status(404).render("404", { title: "404" });
});


console.log("**********  Serveur démarré sur http://localhost:3000  ************");