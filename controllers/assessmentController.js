const Assessment = require("../models/Assessment");
const Publication = require("../models/Publication");
const Group = require("../models/group");
const User = require("../models/User");
const Test = require("../models/Test");


const assessmentList = (req, res) => {
  //console.log(res.locals.user._id);
  Publication.find()
    .sort({ createdAt: -1 })
    .then((publications) => {
     // console.log(publications);
      // Filtrez les publications en fonction de l'appartenance de l'utilisateur à la liste des étudiants
      const filteredPublications = publications.filter(pub => pub.students && pub.students.includes(res.locals.user._id.toString()));
     
      // Affichez uniquement les publications filtrées où l'utilisateur est un étudiant
      res.render("assessments/index", { title: "Your assessments", assessments: filteredPublications });
    })
    .catch((err) => console.log(err));
};

module.exports = {
  assessmentList
};
