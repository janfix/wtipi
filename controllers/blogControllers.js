const Blog = require("../models/Blog");

const blogList = (req, res) => {
  Blog.find()
    .sort({ createdAt: -1 })
    .then((result) => {
      res.render("blogs/index", { title: "All Blogs", blogs: result });
    })
    .catch((err) => console.log(err));
};

const blogDetails = (req, res) => {
  const id = req.params.id;
  Blog.findById(id)
    .then((result) => {
      res.render("blogs/details", { blog: result, title: "Blog Details" });
    })
    .catch((err) => {
      res.status(404).render("404", { title: "Blog not found." });
    });
};

const blogCreateGet = (req, res) => {
  res.render("blogs/create", { title: "Create new Blog" });
};

const blogCreatePost = (req, res) => {
  const blog = new Blog(req.body);

  blog
    .save()
    .then((result) => res.redirect("/blogs"))
    .catch((err) => {
      res.status(500).json({ error: "Server error occurred" });
      console.log("Save blog error: ", err);
    });
};

const blogDelete = (req, res) => {
  const id = req.params.id;

  Blog.findByIdAndDelete(id)
    .then((result) => {
      res.json({ redirect: "/blogs" });
    })
    .catch((err) => console.log(err));
};

module.exports = {
  blogList,
  blogDetails,
  blogCreateGet,
  blogCreatePost,
  blogDelete,
};
