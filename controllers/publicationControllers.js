const Publication = require("../models/Publication");
const User = require("../models/User");
const fsExtra = require('fs-extra');

const publicationList = (req, res) => {
  Publication.find()
    .sort({ createdAt: -1 })
    .then((result) => {
      res.render("publications/index", { title: "All publications", publications: result });
    })
    .catch((err) => console.log(err));
};

const createPublication = async (req, res) => {
  console.log("CALL CREATEPUBLICATION")
  const testID = req.body.testUnicode; // ID du test choisi dans le formulaire
  const unicode = req.body.testurl; // Code unicode généré pour le répertoire

  // Chemin du répertoire source
  const sourceDir = `wtipiTests/test${testID}`;

  // Chemin du répertoire cible
  const targetDir = `wtipiPubs/test${unicode}`;

  try {
      // Copier le répertoire
      await fsExtra.copy(sourceDir, targetDir);
      console.log('Copie réussie!');
      res.redirect('/some-success-page'); // Rediriger vers une page de succès ou autre
  } catch (err) {
      console.error('Erreur lors de la copie des fichiers:', err);
      res.status(500).send("Erreur lors de la création de la publication");
  }
};

const studentList = async  (req, res) => {
  const publicationId = req.params.id;  // L'ID de la publication est obtenu à partir des paramètres de la requête.
  try {
    const publication = await Publication.findById(publicationId);
    if (!publication) {
      return res.status(404).json({ error: "Publication not found" });
    }
    const students = await User.find({
      '_id': { $in: publication.students }
    }).select('firstname lastname email SID _id');  // Select specific fields and exclude _id

    res.json(students);  // Send the students as a JSON response
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error occurred" });
  }
 
};

const publicationDetails = (req, res) => {
  const id = req.params.id;
  Publication.findById(id)
    .then((result) => {
      res.render("publications/details", { publication: result, title: "publication Details" });
    })
    .catch((err) => {
      res.status(404).render("404", { title: "publication not found." });
    });
};

const publicationCreateGet = (req, res) => {
  res.render("publications/create", { title: "Create new publication", defaultServer: process.env.DEFAULT_SERVER  });
};

const publicationCreatePost = (req, res) => {
  const publication = new Publication(req.body);

  publication
    .save()
    .then((result) => res.redirect("/publications"))
    .catch((err) => {
      res.status(500).json({ error: "Server error occurred" });
      console.log("Save publication error: ", err);
    });
};

const pubTestDisplay = (req, res) => {
  const codeIDtest = req.params.codeIDtest;
  res.render('wtipiPubs/test'+codeIDtest);
};

const submitAnswers = (req, res) => {
  const codeIDtest = req.params.codeIDtest;
  console.log(codeIDtest)
};

const publicationDelete = (req, res) => {
  const id = req.params.id;

  Publication.findByIdAndDelete(id)
    .then((result) => {
      res.json({ redirect: "/publications" });
    })
    .catch((err) => console.log(err));
};

module.exports = {
  publicationList,
  publicationDetails,
  publicationCreateGet,
  publicationCreatePost,
  publicationDelete,
  studentList,
  createPublication,
  pubTestDisplay,
  submitAnswers
};
