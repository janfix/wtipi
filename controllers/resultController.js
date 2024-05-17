const xml2js = require('xml2js');
const { createObjectCsvWriter } = require('csv-writer');
const Publication = require('../models/Publication');
const Result = require('../models/Result');

const csvWriter = createObjectCsvWriter({
  path: 'data.csv',
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

function extractTestIdFromURL(url) {
  const regex = /\/test(\d+)\//;
  const match = url.match(regex);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

exports.processResults = async (req, res) => {
  try {
    console.log("DANS LE CONTROLLER !");
    const userId = req.session.userId;
    const currentTest = extractTestIdFromURL(req.headers.referer);
    console.log("currentTest:", currentTest);

    const currentPublication = await Publication.findOne({ testurl: currentTest });
    if (!currentPublication) {
      return res.status(404).send('Publication not found');
    }
    console.log("currentPublication:", currentPublication);

    // Log the raw body of the request
    console.log("Raw request body:", req.body);

    xml2js.parseString(req.body, async (err, result) => {
      if (err) {
        console.error("Error parsing XML:", err);
        return res.status(500).send('Error parsing XML');
      }
      console.log("Parsed XML:", result);

      const itemResults = result.assessmentResult.itemResult.map(item => ({
        timeStamp: Date.now(),
        userID: userId,
        publicationID: currentPublication._id,
        identifier: item.$.identifier,
        value: item.responseVariable[0].candidateResponse[0].value[0],
        outcome: item.outcomeVariable ? item.outcomeVariable[0].value[0] : '0'
      }));
      console.log("itemResults:", itemResults);

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
