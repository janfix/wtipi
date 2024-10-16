const xml2js = require('xml2js');
const { createObjectCsvWriter } = require('csv-writer');
const Publication = require('../models/Publication');
const Result = require('../models/Result');
const path = require('path');
const fs = require('fs');
const csvWriter = require('csv-writer');


const handleHtmlQuizSubmission = async (req, res) => {
/*   console.log('Headers:', req.headers);
  console.log('Body:', req.body); */

  const quizData = req.body;
  const studentId = req.session.studentCode;
  const publicationId = req.session.publicationCode;
  // Chemin vers le fichier CSV
  const filePath = path.join(__dirname, '..', 'data', 'html_quiz_results.csv');

  const currentPublication = await Publication.findOne({ _id: publicationId });
  const scoringRules = currentPublication.testGroup[0].testCorrection;

  //console.log('Scoring Rules (original):', currentPublication.testGroup[0].testCorrection);
  
  console.log('Quiz Data:', quizData); 
  console.log('Scoring Rules (parsed):', scoringRules);

  // Fonction pour calculer le score
  const calculateScore = (answers, scoringRules) => {
    let totalScore = 0;
    const scores = answers.map(answer => {
      let questionId = null;
      let score = 0;

      // Trouver la clé correspondante dans scoringRules
      console.log( answer.codeR)
      for (const code of answer.codeR) {
        console.log(code)
        console.log(answer.codeR.includes(code))
        if (answer.codeR.includes(code)) {
          console.log(code)
          questionId = answer.codeQ;
          console.log("Matched questionId:", questionId);
          
          break;
        }
      }

      

      return {
        timestamp: new Date().toISOString(),
        userID: studentId,
        publicationID: publicationId,
        identifier: answer.question,
        value: answer.answer,
        outcome: score
      };
    });
    return { scores, totalScore };
  };

  // Calculer les scores
  const { scores, totalScore } = calculateScore(quizData.answers, scoringRules);
/*   console.log('quizData.answers:', quizData.answers);
  console.log('scoringRules:', scoringRules);
  console.log("***************************");
  console.log('Calculated Scores:', scores);
  console.log('Total Score:', totalScore); */

  try {
    // Ajouter le totalScore à chaque enregistrement
    scores.forEach(record => {
      record.totalScore = totalScore;
    });

    // Configuration de l'écriture du CSV
    const csv = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'question', title: 'Question' },
        { id: 'answer', title: 'Answer' },
        { id: 'timestamp', title: 'Timestamp' },
        { id: 'userID', title: 'UserID' },
        { id: 'publicationID', title: 'PublicationID' },
        { id: 'outcome', title: 'Outcome' },
        
      ],
      append: true
    });

    // Écriture des données dans le fichier CSV
    await csv.writeRecords(scores);
    console.log('Results saved successfully to CSV');

    // Écriture des données dans la base Mongo
    await Result.insertMany(scores);
    console.log('Results saved successfully to MongoDB');

    res.status(200).send({ message: 'Results saved successfully!' });
  } catch (error) {
    console.error('Error saving results', error);
    res.status(500).send({ message: 'Failed to save results' });
  }
};





const processResults = async (req, res) => {
  console.log("FOUND ROUTE AND CRTOLLER");
  try {
    const testId = req.session.testCode;
    const studentId = req.session.studentCode;
    const publicationId = req.session.publicationCode;

    const currentPublication = await Publication.findOne({ _id: publicationId });
    if (!currentPublication) {
      return res.status(404).send('Publication not found');
    }

    const pubName = currentPublication.csvName;
    const csvPath = path.join(__dirname, '..', 'data', `${pubName}.csv`);
    const csvWriter = createObjectCsvWriter({
      path: csvPath,
      append: true,
      header: [
        { id: 'timeStamp', title: 'TimeStamp' },
        { id: 'userID', title: 'User ID' },
        { id: 'publicationID', title: 'Publication ID' },
        { id: 'identifier', title: 'IDENTIFIER' },
        { id: 'value', title: 'VALUE' },
        { id: 'outcome', title: 'OUTCOME' }
      ]
    });

    xml2js.parseString(req.body, async (err, result) => {
      if (err) {
        console.error("Error parsing XML:", err);
        return res.status(500).send('Error parsing XML');
      }

      if (!result.assessmentResult || !result.assessmentResult.itemResult) {
        console.error("Invalid XML structure:", result);
        return res.status(400).send('Invalid XML structure');
      }

      const itemResults = result.assessmentResult.itemResult.map(item => {
        const responseVariable = item.responseVariable ? item.responseVariable[0] : {};
        const candidateResponse = responseVariable.candidateResponse ? responseVariable.candidateResponse[0] : {};
        const value = candidateResponse.value ? candidateResponse.value[0] : '0';
        const outcomeVariable = item.outcomeVariable ? item.outcomeVariable[0] : {};
        const outcome = outcomeVariable.value ? outcomeVariable.value[0] : '0';

        return {
          timeStamp: Date.now(),
          userID: studentId,
          publicationID: currentPublication._id,
          identifier: item.$.identifier,
          value: value,
          outcome: outcome
        };
      });

      console.log(itemResults);

      try {
        await csvWriter.writeRecords(itemResults);
        console.log("Data written to CSV");
        await Result.insertMany(itemResults);
        console.log("Data written to MongoDB");
        res.send('Data written to CSV and MongoDB successfully');
      } catch (error) {
        console.error("Failed to write to CSV or MongoDB:", error);
        res.status(500).send('Failed to write to CSV or MongoDB');
      }
    });
  } catch (error) {
    console.error("Error in processResults:", error);
    res.status(500).send('Internal Server Error');
  }
};

prepaResults = async (req, res) => {

  const publicationCode = req.params.publicationCode;
  const publicationId = req.params.publicationId;

  console.log("PREPARATION RESULTS")

}

module.exports = {
  processResults,
  prepaResults,
  handleHtmlQuizSubmission
};

// Fonction auxiliaire pour récupérer l'ID utilisateur par rôle
async function getUserIdByRole(studentId, role) {
  const user = await User.findOne({ _id: studentId, role: role });
  return user ? user._id : null;
}

