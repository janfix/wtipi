const express = require("express");
const router = express.Router();
const publicationController = require("../controllers/publicationControllers");
const { requireAuth, requireAuthInPublication  } = require("../middleware/authMiddleware");
const { ObjectId } = require('mongoose').Types;
const Publication = require("../models/Publication");
const path = require("path");
const fs = require('fs');


router.get("/", publicationController.publicationList);

router.post("/", requireAuth(['administrator']), publicationController.publicationCreatePost);

router.get("/create", requireAuth(['administrator']), publicationController.publicationCreateGet);

router.get("/:id",requireAuth(['administrator']), publicationController.publicationDetails);

router.delete("/:id", publicationController.publicationDelete);

router.get("/:id/students", requireAuth(['administrator']), publicationController.studentList);

// Route pour afficher le test d'une publication pour un Administrator
//router.get('/wtipiPubs/:publicationId/test/:testId', requireAuth(['student','administrator']), requireAuthInPublication, publicationController.pubTestDisplay);

//router.get('/:publicationId/test/:testId', requireAuth(['student', 'administrator']), requireAuthInPublication, publicationController.pubTestDisplay);


// Route qui gère la création d'une publication
router.post('/create-publication', publicationController.createPublication);

//Update of Publication date limits
router.post('/:id/update-dates', publicationController.updatePublicationDates);

router.get('/:id/edit-dates', async (req, res) => {
    const publicationId = req.params.id;
    try {
      const publication = await Publication.findById(publicationId);
      if (!publication) {
        return res.status(404).json({ error: "Publication not found" });
      }
      res.render('timeManager', { 
        title: "Edit Publication Dates", 
        publication, 
        startOn: publication.startOn, 
        endOn: publication.endOn 
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error occurred" });
    }
  });

  // Route pour afficher le formulaire de modification du test
router.get('/:id/edit-test', requireAuth(['administrator']), publicationController.editPublicationTest);

// Route pour gérer la soumission du formulaire de modification du test
router.post('/:id/update-test', requireAuth(['administrator']), publicationController.updatePublicationTest);

router.delete('/delete-student/:id', async (req, res) => {
   
    const studentId = new ObjectId(req.params.id);
    

    try {
      // Trouvez et mettez à jour la publication pour supprimer l'étudiant du tableau students
      await Publication.updateOne(
          { 'students': studentId },
          { $pull: { students: studentId } }
      );
      console.log('Student deleted:', result); // Console log pour vérifier la suppression
      res.json({ success: true });
  } catch (error) {
      console.error('Error deleting student:', error);
      res.json({ success: false, error: 'An error occurred while deleting the student' });
  }
});

router.get('/download/:id', async (req, res) => {
  try {
    const publication = await Publication.findById(req.params.id);
    if (!publication) {
      return res.status(404).send('Publication not found');
    }

    const fileName = publication.csvName + '.csv';
    const filePath = path.join(__dirname, '../data', fileName);
    console.log(filePath)
    
    // Vérifiez si le fichier existe
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(404).send({
          message: "Could not download the file. File not found.",
        });
      }

      // Si le fichier existe, le télécharger
      res.download(filePath, (err) => {
        if (err) {
          res.status(500).send({
            message: "Could not download the file. " + err,
          });
        }
      });
    });
  } catch (err) {
    res.status(500).send({
      message: "Error retrieving the file. " + err,
    });
  }
});


module.exports = router;
