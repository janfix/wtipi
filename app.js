require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const blogRoutes = require("./routes/blogRoutes");
const groupRoutes = require("./routes/groupRoutes");
const authRoutes = require("./routes/authRoutes");
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


mongoose
  .connect(dbURI)
  .then((result) => app.listen(3000))
  .catch((err) => console.log(err));

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Insérer ici la vérification de l'utilisateur pour toutes les routes
app.get("*", checkUser);

app.get("/", (req, res) => {
  res.redirect("/blogs");
});

app.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});


//Route pour télécharger le CSV
app.post("/upload-csv", uploadcsv.single("csvFile"), async (req, res) => {
  const results = [];

  fs.createReadStream(req.file.path)
      .pipe(csv({ separator: ',' }))
      .on('data', (data) => results.push(data))
      .on('end', async () => {
          try {
              for (let user of results) {
                  const newUser = new User({
                      firstname: user.firstname,
                      lastname: user.lastname,
                      email: user.email,
                      password: user.password,
                      SID: user.id,
                      group: ["nom du groupe actuel"] // Remplacer par le groupe réel si nécessaire
                  });
                  await newUser.save();
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

/* app.post('/uploadcsv', uploadcsv.single('file'), (req, res) => {
  console.log("CSV TREATMENT")
  const results = [];
  const tempPath = req.file.path;
  fs.createReadStream(tempPath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      // Assumer que chaque ligne a un champ 'id'
      const studentIds = results.map(row => row.id);
      console.log(studentIds);
      const newGroup = new Group({
        students: studentIds
      });
      newGroup.save().then(() => {
        fs.unlink(tempPath, (err) => { // Nettoyage du fichier temporaire
          if (err) console.error("Error deleting temp file", err);
        });
        res.send('File uploaded and students inserted into MongoDB.');
      }).catch(err => {
        console.error(err);
        res.status(500).send('Error inserting data into MongoDB');
      });
    });


}) */


// Route pour télécharger le fichier ZIP
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    console.log('Route /upload atteinte');
    return res.status(400).send('No file uploaded.');
  } else {
    try {     
      // Chemin où le fichier ZIP téléchargé est temporairement stocké
      const tempPath = req.file.path;
      console.log(tempPath)
        console.log("ZIP TREATMENT");
        const zip = new AdmZip(tempPath);
        const zipEntries = zip.getEntries(); // Un tableau des entrées (fichiers/dossiers) du ZIP
        let uniq = "test" + Date.now()
        zipEntries.forEach(entry => {
          let entryName = entry.entryName;
          zip.extractEntryTo(entry, 'testing/' + uniq + `/${req.file.originalname}/`, false, true);
        });
      res.send("Fichier extrait !");
    } catch (error) {
      console.log(error);
      res.status(500).send('Server error.');
    }
  }
});

app.use("/blogs", blogRoutes);
app.use("/groups", groupRoutes);

app.use(authRoutes);

app.use((req, res) => {
  res.status(404).render("404", { title: "404" });
});


console.log("**********  Serveur démarré sur http://localhost:3000  ************");