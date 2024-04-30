const Test = require("../models/Test");

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
  res.render("tests/create", { title: "Create new test" });
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


module.exports = {
  testList,
  testDetails,
  testCreateGet,
  testCreatePost,
  testDelete,
  testDisplay,
};
