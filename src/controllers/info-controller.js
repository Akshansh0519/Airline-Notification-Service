const { StatusCodes } = require('http-status-codes');

const info = (req, res) => {
    return res.status(StatusCodes.OK).json({
        success : true,
        name: "Base Project",
        description: "This is a base project for building RESTful APIs using Node.js and Express.",
        msg:"api is alive",
        error : {},
        data : {}
    });
}
module.exports = { info }