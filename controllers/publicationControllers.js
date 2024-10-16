const Publication = require("../models/Publication");
const Test = require("../models/Test");
const Group = require("../models/group");
const User = require("../models/User");
const fsExtra = require('fs-extra');
const { ObjectId } = require('mongoose').Types;
const fs = require('fs');
const path = require('path');

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
  //console.log(req.body)
  const testID = req.body.testUnicode; // ID du test choisi dans le formulaire
  console.log("------------------------")
  console.log(testID)
  //const groupTarget = req.body.testGroup[0].groupId; 
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
  const page = parseInt(req.query.page) || 1;
  const limit = 10; // Nombre d'étudiants par page
  
  try {
    const publication = await Publication.findById(publicationId);
    if (!publication) {
      return res.status(404).json({ error: "Publication not found" });
    }
    const students = await User.find({
      '_id': { $in: publication.students }
    })
    .skip((page - 1) * limit)
    .limit(limit)
    .select('firstname lastname email SID _id school grade mailStatus'); // Sélectionner des champs spécifiques


    const total = await User.countDocuments({
      '_id': { $in: publication.students }
    });

    const response = { students, total };
    //console.log('Response:', response); // Ajout d'un log pour vérifier la réponse

    res.json({ response });   
  } catch (err) {
    //console.error(err);
    res.status(500).json({ error: "Server error occurred" });
  }
 
};

const publicationDetails = async (req, res) => {
  const id = req.params.id;
  try {
    const publication = await Publication.findById(id);
    const tests = await Test.find();
    const groups = await Group.find();

    // Définir correctement iframeUrl en fonction de votre logique d'application
    /* console.log(publication)
    console.log("PublicationUNICODE",publication.testGroup[0].testUnicode )
    console.log("Publication._id",publication._id )
    console.log("Publication.testurl",publication.testurl) */

    const iframeUrl = `/wtipiTests/test${publication.testGroup[0].testUnicode}/index.html`;



    if (!publication) {
      return res.status(404).render("404", { title: "Publication not found." });
    }

    res.render("publications/details", { 
      publication, 
      title: "Publication Details",
      tests, 
      groups,
      iframeUrl
    });
  } catch (err) {
    console.error(err);
    res.status(500).render("500", { title: "Server error" });
  }
};


const publicationCreateGet = (req, res) => {
  res.render("publications/create", { title: "Create new publication", defaultServer: process.env.DEFAULT_SERVER  });
};


const sanitizeFileName = (fileName) => {
  return fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
};

const publicationCreatePost = async (req, res) => {
  try {
    // Créer une nouvelle instance de Publication avec les données de la requête
    const savedPublication = new Publication(req.body);

    // Générer le csvName
    const sanitizedTitle = sanitizeFileName(savedPublication.title);
    savedPublication.csvName = `${sanitizedTitle}_${savedPublication._id}`;

    // Sauvegarder la publication
    await savedPublication.save();

    // Mise à jour des étudiants du groupe cible
    const groupTarget = req.body.testGroup.groupID;
    const testInPub = req.body.testurl;

    await User.updateMany(
      { group: { $in: [groupTarget] }, role: 'student' },
      { $push: { publication: savedPublication._id, tests: testInPub } }
    );

    // Redirection après succès
    res.redirect("/publications");
  } catch (err) {
    res.status(500).json({ error: "Server error occurred" });
    console.log("Save publication error: ", err);
  }
};

const pubTestDisplay = async (req, res) => {
  const publicationId = req.params.publicationId;
  const testId = req.params.testId;

  try {
    const publication = await Publication.findById(publicationId);
    if (!publication) {
      return res.status(404).send("Publication not found.");
    }

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).send("Test not found.");
    }

    res.render('testDetail', { 
      title: "Test Display", 
      iframeUrl: `/wtipiPubs/${publicationId}/test${test.uniCode}/index.html`
    });
  } catch (error) {
    console.error("Error displaying test:", error);
    res.status(500).send("Internal server error");
  }
};


const submitAnswers = (req, res) => {
  const codeIDtest = req.params.codeIDtest;
  //console.log(codeIDtest)
};

const publicationDelete = (req, res) => {
  const id = req.params.id;

  Publication.findByIdAndDelete(id)
    .then((result) => {
      res.json({ redirect: "/publications" });
    })
    .catch((err) => console.log(err));
};

const updatePublicationDates = async (req, res) => {
  const publicationId = req.params.id;
  const { startOn, endOn } = req.body;

  try {
    const updatedPublication = await Publication.findByIdAndUpdate(
      publicationId,
      { startOn: new Date(startOn), endOn: new Date(endOn) },
      { new: true }
    );
    if (!updatedPublication) {
      return res.status(404).json({ error: "Publication not found" });
    }
    res.redirect(`/publications/${publicationId}`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error occurred" });
  }
};



// Afficher le formulaire de modification du test avec une liste des tests disponibles
const editPublicationTest = async (req, res) => {
  const publicationId = req.params.id;
  try {
      const publication = await Publication.findById(publicationId);
      const tests = await Test.find();
      if (!publication) {
          return res.status(404).json({ error: "Publication not found" });
      }
      res.render('editTest', { 
          title: "Edit Publication Test", 
          publication,
          tests 
      });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error occurred" });
  }
};

// Mettre à jour le test de la publication
const updatePublicationTest = async (req, res) => {
  //console.log("TRIGGED UPDATE !!!")
  const publicationId = req.params.id;
  //console.log(req.body)
  const { testId, groupID } = req.body;

  try {
      const test = await Test.findById(testId);
      console.log(test._id)
      console.log("UNICODE TEST ACTIF :", test.uniCode)
      if (!test) {
          return res.status(404).json({ error: "Test not found" });
      }

      const publication = await Publication.findById(publicationId);
      if (!publication) {
          console.log("Publication not found.");
          return res.status(404).json({ error: "Publication not found" });
      }

      const objectGroupID = new ObjectId(groupID);
      //const groupExists = publication.testGroup.some(group => group.groupID.equals(objectGroupID));
      const groupExists = publication.testGroup.some(group => new ObjectId(group.groupID).equals(objectGroupID));
      if (!groupExists) {
          console.log("Group ID not found in testGroup.");
          return res.status(404).json({ error: "Group ID not found in testGroup" });
      }

      const updatedPublication = await Publication.findOneAndUpdate(
          { _id: publicationId, "testGroup.groupID": objectGroupID.toString() },
          { 
              $set: { 
                  "testGroup.$.testId": new ObjectId(test._id), 
                  "testGroup.$.testName": test.title,
                  "testGroup.$.testUnicode": test.uniCode
              } 
          },
          { new: true }
      );

      if (!updatedPublication) {
          console.log("Publication not found for update.");
          return res.status(404).json({ error: "Publication not found" });
      }

      // Copier les fichiers du test vers le répertoire de la publication
      const sourceDir = test.testpath;
      const destDir = path.join("wtipiPubs", "test" + publication.testurl);

      try {
          await emptyDirectory(destDir);  // Vider le répertoire de destination
          await copyFiles(sourceDir, destDir);  // Copier les nouveaux fichiers
      } catch (copyError) {
          console.error("Error copying files:", copyError);
          return res.status(500).json({ error: "Error copying files" });
      }

      res.redirect(`/publications/${publicationId}`);
  } catch (err) {
      console.error("Error updating publication:", err);
      res.status(500).json({ error: "Server error occurred" });
  }
};


// Fonction pour vider le répertoire de destination
const emptyDirectory = async (dir) => {
  if (fsExtra.existsSync(dir)) {
    try {
      await fsExtra.emptyDir(dir);
    } catch (err) {
      console.error(`Error emptying directory ${dir}:`, err);
      throw err;
    }
  }
};

// Fonction pour copier les fichiers d'un répertoire source vers un répertoire de destination
const copyFiles = async (sourceDir, destDir) => {
  try {
    await fsExtra.copy(sourceDir, destDir, { overwrite: true });
  } catch (err) {
    console.error(`Error copying files from ${sourceDir} to ${destDir}:`, err);
    throw err;
  }
};





module.exports = {
  publicationList,
  createPublication,
  studentList,
  publicationDetails,
  publicationCreateGet,
  publicationCreatePost,
  updatePublicationDates,
  publicationDelete,
  editPublicationTest,
  updatePublicationTest,
  pubTestDisplay
};