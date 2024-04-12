require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const blogRoutes = require("./routes/blogRoutes");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const AdmZip = require("adm-zip");
const fs = require("fs");
const path = require("path");
const { checkUser } = require("./middleware/authMiddleware");

const app = express();

// Configuration de Multer
const upload = multer({ dest: 'upload/' });

const dbURI = process.env.DB_URI;

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

// Route pour télécharger le fichier ZIP
app.post('/upload', upload.single('file'), (req, res) => {
  // Vérifie si un fichier a été téléchargé
  if (!req.file) {
    console.log('Route /upload atteinte');
    console.log(req.file)
    return res.status(400).send('No file uploaded.');
  } else{
    console.log("MAIS OUUUUIIIIII Bravo!!!!")
    try {
      // Chemin où le fichier ZIP téléchargé est temporairement stocké
      const tempPath = req.file.path;
  
      // Créer une instance de AdmZip
      const zip = new AdmZip(tempPath);
      const zipEntries = zip.getEntries(); // Un tableau des entrées (fichiers/dossiers) du ZIP
  
      // Validation du contenu du ZIP (exemple simple)
     /*  const isValid = zipEntries.every(entry => {
        // Ici, vous pouvez ajouter des conditions de validation spécifiques,
        // par exemple vérifier les types de fichiers, les noms, etc.
        return !entry.isDirectory && path.extname(entry.entryName) === '.txt';
      });
  
      if (!isValid) {
        return res.status(400).send('Invalid ZIP content.');
      } */
  
      // Si valide, copiez le fichier ZIP à l'emplacement désiré
      const targetPath = path.join(__dirname, 'destination', 'test123456789.zip');
      console.log("UPLOAD CHECK!")
      fs.copyFileSync(tempPath, targetPath);
  
      res.send('File uploaded and validated successfully.');
    } catch (error) {
      console.log(error);
      res.status(500).send('Server error.');
    } 
  }

/*  */

});

app.use("/blogs", blogRoutes);

app.use(authRoutes);

app.use((req, res) => {
  res.status(404).render("404", { title: "404" });
});
