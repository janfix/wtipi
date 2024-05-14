const Assessment = require("../models/Assessment");
const Publication = require("../models/Publication");
const Group = require("../models/group");
const User = require("../models/User");
const Test = require("../models/Test");


const assessmentList = (req, res) => {
  //console.log(res.locals.user._id);

  //console.log(req.session.userId)
  Publication.find()
    .sort({ createdAt: -1 })
    .then((publications) => {
     // console.log(publications);
      // Filtrez les publications en fonction de l'appartenance de l'utilisateur à la liste des étudiants
      const filteredPublications = publications.filter(pub => pub.students && pub.students.includes(res.locals.user._id.toString()));
     // console.log(filteredPublications[0].testGroup)
      // Affichez uniquement les publications filtrées où l'utilisateur est un étudiant
      res.render("assessments/index", { title: "Your assessments", assessments: filteredPublications });
    })
    .catch((err) => console.log(err));
};

const serveAssessment = (req, res) => {
  console.log("Ceci n'est jamais appelé ?")
  /* const publicationCode = req.params.publicationCode;
  const filePath = path.join(__dirname, 'wtipiPubs', publicationCode);
  Publication.findOne({ code: publicationCode })
    .then(publication => {
      if (!publication || !publication.students.includes(req.session.userId)) {
        return res.status(403).send('Accès refusé');
      }

      if (!publication.students.includes(req.session.userId)) {
        return res.status(403).send('Accès refusé');
      }

      const filePath = path.resolve(__dirname, `../wtipiPubs/${publicationCode}/index.html`);
      res.sendFile(filePath);

      // Vous pourriez vouloir servir un fichier spécifique ou un index.html par défaut
      const fileToSend = path.join(filePath, 'index.html');
      if (fs.existsSync(fileToSend)) {
        res.sendFile(fileToSend);
      } else {
        res.status(404).send('Fichier non trouvé');
      }
    })
    .catch(err => {
      console.error('Erreur lors de la recherche de la publication', err);
      res.status(500).send('Erreur serveur');
    }); */
};


module.exports = {
  assessmentList,
  serveAssessment
};
