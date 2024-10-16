const Group = require("../models/group");
const User = require("../models/User");


const groupList = (req, res) => {
  Group.find()
    .sort({ createdAt: -1 })
    .then((result) => {
      res.render("groups/index", { title: "All groups", groups: result });
    })
    .catch((err) => console.log(err));
};

const studentList = async  (req, res) => {
  const groupId = req.params.id;  // L'ID de la group est obtenu à partir des paramètres de la requête.
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100; // Définit un nombre d'étudiants par page
  const skip = (page - 1) * limit;  // Calcule le nombre d'étudiants à sauter

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Récupère les étudiants avec la pagination
    const students = await User.find({ '_id': { $in: group.students } })
                               .select('SID lastname firstname email school sector grade town zipcode mailStatus -_id')
                               .skip(skip)
                               .limit(limit);

    // Compte le nombre total d'étudiants dans le groupe
    const total = await User.countDocuments({ '_id': { $in: group.students } });

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      students
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error occurred" });
  }
 
};

const groupDetails = (req, res) => {
  const id = req.params.id;
  Group.findById(id)
    .then((result) => {
      res.render("groups/details", { 
        group: result, 
        title: "group Details",
        user: res.locals.user
       });
    })
    .catch((err) => {
      res.status(404).render("404", { 
        title: "group not found.",
        user: res.locals.user
      });
    });
};

const groupCreateGet = (req, res) => {
  res.render("groups/create", { title: "Create new group" });
};

const groupCreatePost = (req, res) => {
  //console.log(req.body)
  const group = new Group(req.body);
  console.log(group)

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

  Group.findByIdAndDelete(id)
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
  targetGroup,
  studentList
};
