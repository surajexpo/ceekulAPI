const { ApiError } = require('../errorHandler');
const { Admin } = require('../models/authModels');
const { verifyAccessToken } = require('../utils');

const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    const legit = verifyAccessToken(token);
    const admin = await Admin.findById(legit.id);
    // if (!admin.status) throw new ApiError('you are blocked', 403);
    if (admin) {
      req.admin = admin;
      req.token = token;
      return next();
    }
    throw new ApiError('Access forbidden', 403);
  } catch (err) {
    console.log(err.message);
        next(err);
  }
};

module.exports = authenticateAdmin;
