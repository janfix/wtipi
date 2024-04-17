const Group = require("../models/group");


const groupList = (req, res) => {
  Group.find()
    .sort({ createdAt: -1 })
    .then((result) => {
      res.render("groups/index", { title: "All groups", groups: result });
    })
    .catch((err) => console.log(err));
};

const groupDetails = (req, res) => {
  const id = req.params.id;
  Group.findById(id)
    .then((result) => {
      res.render("groups/details", { group: result, title: "group Details" });
    })
    .catch((err) => {
      res.status(404).render("404", { title: "group not found." });
    });
};

const groupCreateGet = (req, res) => {
  res.render("groups/create", { title: "Create new group" });
};

const groupCreatePost = (req, res) => {
  //console.log(req.body)
  const group = new Group(req.body);

  group
    .save()
    .then((result) =>{ 
      res.json({ success: true, groupId: result._id }); // Get the ID Group in MongoDB
      
    })
    .catch((err) => {
      res.status(500).json({ error: "Server error occurred" });
      console.log("Save group error: ", err);
    });
};

const groupDelete = (req, res) => {
  const id = req.params.id;

  group.findByIdAndDelete(id)
    .then((result) => {
      res.json({ redirect: "/groups" });
    })
    .catch((err) => console.log(err));
};

const targetGroup = (req, res) => {
  const id = req.params.id;
  //Choose a test for this group
};

module.exports = {
  groupList,
  groupDetails,
  groupCreateGet,
  groupCreatePost,
  groupDelete,
  targetGroup
};
