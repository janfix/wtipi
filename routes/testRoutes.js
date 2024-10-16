const express = require("express");
const router = express.Router();
const testController = require("../controllers/testControllers");
const multer = require('multer');
const publicationController = require("../controllers/publicationControllers");
const { requireAuth } = require("../middleware/authMiddleware");
const path = require("path");
const fs = require('fs');

// Configuration de Multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    // Assurez-vous que le dossier existe
    if (!fs.existsSync(uploadDir)){
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.get("/", requireAuth(['administrator']), testController.testList);

router.post("/", testController.testCreatePost);

router.get("/create", requireAuth(['administrator']), testController.testCreateGet);

router.get("/:id", requireAuth(['administrator']), testController.testDetails);

router.delete("/:id", testController.testDelete);

// Route pour l'iframe preview test
router.get("/wtipiTests/:codeIDtest", requireAuth(['administrator']), testController.testDisplay);

// Route pour afficher le formulaire de modification du test avec une liste des tests disponibles
router.get('/:id/edit-test', requireAuth(['administrator']), publicationController.editPublicationTest);

// Route pour gérer la soumission du formulaire de modification du test
router.post('/:id/update-test', requireAuth(['administrator']), publicationController.updatePublicationTest);

// Route pour l'upload du fichier ZIP
router.post('/upload-zip', upload.single('file'), testController.uploadZip);

// Route pour installer le test en fonction de son type
router.post('/installTest', testController.installTest);

module.exports = router;
