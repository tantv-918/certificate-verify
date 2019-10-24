const jwt = require('jsonwebtoken');
const secretJWT = require('../configs/secret').secret;
const USER_ROLES = require('../configs/constant').USER_ROLES;

exports.signToken = (req, res) => {
  jwt.sign({ userId: req.user._id }, secretJWT, { expiresIn: '5 min' }, (err, token) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json({
        success: true,
        msg: 'Login success',
        role: USER_ROLES.STUDENT,
        token: token
      });
    }
  });
};
