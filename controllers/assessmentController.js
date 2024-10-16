const Assessment = require("../models/Assessment");
const Publication = require("../models/Publication");
const Group = require("../models/group");
const User = require("../models/User");
const Test = require("../models/Test");
const path = require("path");
const { ObjectId } = require('mongodb');
const fs = require("fs");
const fsExtra = require("fs-extra"); 



const assessmentList = (req, res) => {
  //console.log(res.locals.user._id);
  Publication.find()
    .sort({ createdAt: -1 })
    .then((publications) => {
     // console.log(publications);
      // Filtrez les publications en fonction de l'appartenance de l'utilisateur à la liste des étudiants
      const filteredPublications = publications.filter(pub => pub.students && pub.students.includes(res.locals.user._id.toString()));
     // console.log(filteredPublications[0].testGroup)
      // Affichez uniquement les publications filtrées où l'utilisateur est un étudiant
      res.render("assessments/index", { title: "Your assessments", assessments: filteredPublications, userId : res.locals.user._id.toString()});
    })
    .catch((err) => console.log(err));
};

const serveAssessment = (req, res) => {
 
  const publicationCode = req.params.publicationCode;
  const publicationId = req.params.publicationId;
  console.log(req.session.userId)
  
  //console.log("publicationCode:", publicationCode)
  //console.log("StudentCode:", publicationId)
 
  // Convertir publicationId en ObjectId
  let Publication_objectId;
  try {
    let cleanpublicationId = publicationId.replace('student', '');
    Publication_objectId = new ObjectId(cleanpublicationId);
  } catch (error) {
    return res.status(400).send('Invalid publication ID format - Please; log out and Log in again');
  }

  const filePath = path.join(__dirname, '..', 'wtipiPubs', `test${publicationCode}`,'index.html');
   // console.log("Generated file path:", filePath);

  Publication.findOne({ _id: Publication_objectId, testurl: publicationCode })
    .then(publication => {
      
     /*  if (!publication || !publication.students.includes(req.userId)) {
        return res.status(403).send('Accès refusé');
      } */
      
      res.sendFile(filePath);
    })
    .catch(err => {
      console.error('Erreur lors de la recherche de la publication', err);
      res.status(500).send('Erreur serveur');
    });
};


module.exports = {
  assessmentList,
  serveAssessment
};
