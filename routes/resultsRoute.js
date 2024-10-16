const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const Result = require('../models/Result');
const User = require('../models/User');

// Définir une route avec des paramètres dynamiques pour l'identifiant du test et l'identifiant de l'étudiant
router.post('/process_results', resultController.processResults);

// Route pour le nouveau type de questionnaire HTML
router.post('/submitHtmlQuiz', resultController.handleHtmlQuizSubmission);

router.get('/results', async (req, res) => {
    const pubID = req.query.pubID;
    if (!pubID) {
        return res.status(400).send('Publication ID is required');
    }

    try {
        const results = await Result.find({ publicationID: pubID }).exec();

        
        
        // Créer un tableau de promesses pour obtenir les informations des utilisateurs
        const resultsWithUserInfo = await Promise.all(results.map(async (result) => {
            const user = await User.findById(result.userID).exec();
            
            return {
                ...result.toObject(),
                user: {
                    firstName: user.firstname,
                    lastName: user.lastname,
                    SID: user.SID
                }
            };
        }));

        res.json({ results: resultsWithUserInfo });
    } catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).send('Error fetching results');
    }
});


module.exports = router;

