const Parameter = require('../models/Parameter');

exports.parametersList = async (req, res) => {
    console.log("PARAMETERS CONTROLLER");
    res.render("parameters", { title: "parameters" });
};

