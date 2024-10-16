const Test = require("../models/Test");
const path = require('path');
const fs = require('fs');
const fsExtra = require("fs-extra");
const AdmZip = require('adm-zip');
const xml2js = require('xml2js');

var testTypeSelector; // values : QTI22Tao, allQTI, other ??

const testList = (req, res) => {
  Test.find()
    .sort({ createdAt: -1 })
    .then((result) => {
      res.render("tests/index", { title: "All tests", tests: result });
    })
    .catch((err) => console.log(err));
};

const testDetails = (req, res) => {
  const id = req.params.id;
  Test.findById(id)
    .then((result) => {
      res.render("tests/details", { test: result, title: "test Details" });
    })
    .catch((err) => {
      res.status(404).render("404", { title: "test not found." });
    });
};

const testCreateGet = (req, res) => {
  res.render("tests/create", { title: "Create new test", metadata: null, testInfo: null, testDetails: null, message: null });
};

const testCreatePost = (req, res) => {
  const test = new Test(req.body);

  test
    .save()
    .then((result) => res.redirect("/tests"))
    .catch((err) => {
      res.status(500).json({ error: "Server error occurred" });
      console.log("Save test error: ", err);
    });
};

const testDelete = (req, res) => {
  const id = req.params.id;

  Test.findByIdAndDelete(id)
    .then((result) => {
      res.json({ redirect: "/tests" });
    })
    .catch((err) => console.log(err));
};

const testDisplay = (req, res) => {
  const codeIDtest = req.params.codeIDtest;
  res.render('testDetail', { iframeUrl: `/tests/${codeIDtest}/index.html` });
};

const uploadZip = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const tempPath = req.file.path;
  const targetPath = path.join(__dirname, '../uploads', req.file.filename);
  let testInfo = null;

  console.log("tempPath:", tempPath)
  console.log("targetPath:", targetPath)

  fs.rename(tempPath, targetPath, err => {
    if (err) {
      console.error('Error processing file:', err);
      return res.status(500).json({ message: 'Error processing file' });
    }

    console.log("targetPath:", targetPath) 

    try {
      // Analyze the ZIP file
      let zip = new AdmZip(targetPath);
      let zipEntries = zip.getEntries();

      // Look for test.xml and rename to index.xml if it exists
     /*  const testQTI = zipEntries.find(entry => entry.entryName === "test.xml");
      if (testQTI) {
        // Rename test.xml to index.xml
        const newEntryName = "index.xml";
        zip.renameEntry(testQTI, newEntryName);
        // Save the updated ZIP file
        zip.writeZip(targetPath);

        // Re-read the updated ZIP file
        zip = new AdmZip(targetPath);
        zipEntries = zip.getEntries();
      } */

      const manifestEntry = zipEntries.find(entry => entry.entryName === "imsmanifest.xml");
      let basicQTI = zipEntries.find(entry => entry.entryName === "index.xml");
      const pureHTML = zipEntries.find(entry => entry.entryName === "manifest.json");

      if (manifestEntry) {
        testTypeSelector = "QTI22Tao";
        const xmlContent = manifestEntry.getData().toString('utf8');

        // Use xml2js to parse the XML content
        xml2js.parseString(xmlContent, (err, result) => {
          if (err) {
            console.error('Error parsing XML:', err);
            return res.status(500).json({ message: 'Error parsing XML' });
          }

          // Access metadata
          const metadata = result?.manifest?.metadata?.[0];

          // Extract the path of test.xml and its dependencies
          const resources = result?.manifest?.resources?.[0]?.resource;
          if (resources) {
            resources.forEach(resource => {
              if (resource.$.type === "imsqti_test_xmlv2p2") {
                testInfo = {
                  path: resource.$.href,
                  dependencies: resource.dependency?.map(dep => dep.$.identifierref),
                  metadata: resource.metadata
                };
              }
            });
          }
          if (testInfo) {
            // Read the content of test.xml
            const testEntry = zipEntries.find(entry => entry.entryName === testInfo.path);
            return xmlGrabber(res, targetPath, metadata, testInfo, testEntry);
          } else {
            return res.json({ message: 'File uploaded but test.xml not found', metadata });
          }
        });
      } else if (basicQTI) {
        testTypeSelector = "allQTI";
        const soloQTI = zipEntries.find(entry => entry.entryName === "index.html");
        if (!soloQTI) { testTypeSelector = "soloQTI"; }
        const metadata = "";
        console.log("FOUND BASIC QTI");
        return xmlGrabber(res, targetPath, metadata, testInfo, basicQTI);
      } else if (pureHTML) {
        testTypeSelector = "pureHTML";
        const manifestContent = pureHTML.getData().toString('utf8');
        let manifestData;
        try {
          manifestData = JSON.parse(manifestContent);
        } catch (err) {
          console.error('Error parsing JSON:', err);
          return res.status(500).json({ message: 'Error parsing JSON' });
        }

        console.log("simple html");

        const metadata = manifestData.metadata;
        let testDetails = {};
        testDetails.testType = manifestData.testType;
        testDetails.toolName = manifestData.toolName;
        testDetails.title = manifestData.title;
        testDetails.allowLateSubmission = manifestData.allowLateSubmission;
        testDetails.navigationMode = manifestData.navigationMode;
        testDetails.submissionMode = manifestData.submissionMode;
        testDetails.itemCount = manifestData.itemCount;
        testDetails.itemDetails = manifestData.itemDetails;
        testDetails.score = manifestData.score;

        return res.json({ metadata, testInfo, testDetails, targetPath });
      } else {
       
        console.log("DELETE FILE TO DO")
        return res.json({ message: 'File uploaded but imsmanifest.xml, index.xml, or manifest.json not found' });
      }
    } catch (err) {
      console.error('Error handling ZIP file:', err);
      return res.status(500).json({ message: 'Error handling ZIP file' });
    }
  });
};


const installTest = async (req, res) => {
  const uniCode = req.body.uniCode;
  const uniq = "test" + uniCode;
  const tempPath = req.body.zipFileName;
  const test = new Test(req.body);

  console.log(tempPath)

  test
    .save()
    .catch((err) => {
      res.status(500).json({ error: "Server error occurred" });
      console.log("Save test error: ", err);
    });



  try {
    const zip = new AdmZip(tempPath);

    // Vérifiez que le fichier ZIP est valide
    try {
      zip.getEntries(); // Cette méthode lève une erreur si le fichier ZIP est corrompu
    } catch (err) {
      throw new Error('Invalid ZIP file');
    }

    // Remonter d'un niveau à partir de __dirname
    const oneLevelUp = path.resolve(__dirname, '..');

    // Ajouter le contenu du répertoire 'packQtiPlayer' au zip dans le cas de QTI22Tao
    if (testTypeSelector == "QTI22Tao") {
      const packQtiPlayerPath = path.join(oneLevelUp, 'packQtiPlayer');
      const files = await fsExtra.readdir(packQtiPlayerPath);

      for (const file of files) {
        const filePath = path.join(packQtiPlayerPath, file);
        if (await fsExtra.stat(filePath).then(stat => stat.isDirectory())) {
          zip.addLocalFolder(filePath, path.basename(filePath));
        } else {
          zip.addLocalFile(filePath);
        }
      }
    }

   // Ajouter le contenu du répertoire 'packSoloQti' au zip dans le cas de QTI22 from ChatGPT
   if (testTypeSelector == "soloQTI") {
    const packSoloQtiPath = path.join(oneLevelUp, 'packSoloQTI');
    const files = await fsExtra.readdir(packSoloQtiPath);

    for (const file of files) {
      const filePath = path.join(packSoloQtiPath, file);
      if (await fsExtra.stat(filePath).then(stat => stat.isDirectory())) {
        zip.addLocalFolder(filePath, path.basename(filePath));
      } else {
        zip.addLocalFile(filePath);
      }
    }
  }


    const newZipPath = path.join(oneLevelUp, 'uploads', `${uniq}.zip`);
    console.log(newZipPath)
    zip.writeZip(newZipPath);

    const newZip = new AdmZip(newZipPath); // Créez une nouvelle instance pour le fichier ZIP modifié

    console.log("dans le process de copy")

    newZip.extractAllTo(path.join(oneLevelUp, 'wtipiTests', uniq), true);
    await fsExtra.remove(newZipPath);

    try {

      const testurl = path.join('wtipiTests', uniq);
      const existingTest = await Test.findOne({ uniCode: uniCode });

      if (existingTest) {
        await Test.findOneAndUpdate({ uniCode: uniCode }, { testpath: testurl }, { new: true });
        res.redirect("/tests");
      } else {
        console.log("Aucun test correspondant trouvé pour ce uniCode");
      }

    } catch (error) {
      console.error("Erreur d'enregistrement dans MongoDB:", error);
      res.status(500).send("Erreur du serveur.");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error.');
  } finally {
    await fsExtra.remove(tempPath);
  }


}

function xmlGrabber(res, targetPath, metadata, testInfo, testEntry) {

  if (testEntry) {
    const testXmlContent = testEntry.getData().toString('utf8');

    // Utiliser xml2js pour parser le contenu de test.xml
    xml2js.parseString(testXmlContent, (err, testResult) => {
      if (err) {
        console.error('Error parsing test XML:', err);
        return res.status(500).json({ message: 'Error parsing test XML' });
      }

      const assessmentTest = testResult?.assessmentTest;
      const testType = assessmentTest.$.xmlns;
      const toolName = assessmentTest.$.toolName;
      const title = assessmentTest.$.title;
      const allowLateSubmission = assessmentTest?.timeLimits?.[0]?.$.allowLateSubmission;
      const testPart = assessmentTest?.testPart?.[0];
      const navigationMode = testPart.$.navigationMode;
      const submissionMode = testPart.$.submissionMode;

      const items = testPart?.assessmentSection?.[0]?.assessmentItemRef || [];
      const itemCount = items.length;
      const itemDetails = items.map(item => ({
        identifier: item.$.identifier,
        maxAttempts: item.itemSessionControl?.[0]?.$.maxAttempts || "N/A"
      }));

      const testDetails = {
        testType,
        toolName,
        title,
        allowLateSubmission,
        navigationMode,
        submissionMode,
        itemCount,
        itemDetails
      };

      // Rendre la vue avec les données extraites
      res.json({ metadata, testInfo, testDetails, targetPath });
    });
  } else {
    res.json({ message: 'File uploaded but test.xml not found', metadata, testInfo });
  }
}

module.exports = {
  testList,
  testDetails,
  testCreateGet,
  testCreatePost,
  testDelete,
  testDisplay,
  uploadZip,
  installTest
};
