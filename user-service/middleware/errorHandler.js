module.exports = (err, req, res, next) => {
    let message = "Internal server error";
    let code = 500;
    res.status(code).json(message);
}