const router = require('express').Router();
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network');
const { check, validationResult, sanitizeParam } = require('express-validator');
const User = require('../models/User');
const checkJWT = require('../middlewares/check-jwt');

router.get(
  '/:subjectId/:studentUsername',
  checkJWT,
  [
    (sanitizeParam('subjectId')
      .trim()
      .escape(),
    sanitizeParam('studentUsername')
      .trim()
      .escape())
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array(), status: '422' });
    }

    if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
      return res.json({
        success: false,
        msg: 'Permission Denied',
        status: 403
      });
    }
    let identity = req.body.studentUsername;
    User.findOne({ username: identity, role: USER_ROLES.STUDENT }, async (err, student) => {
      if (err) {
        return res.json({
          success: false,
          msg: err
        });
      }
      if (student) {
        let score = [req.body.subjectId, identity];
        const networkObj = await network.connectToNetwork(req.decoded.user);
        const response = await network.query(networkObj, score);
        if (!response.success) {
          return res.json({
            success: false,
            msg: response.msg
          });
        }
        return res.json({
          success: true,
          msg: response.msg
        });
      }
    });
  }
);

router.get('/all', async (req, res) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    return res.json({
      success: false,
      msg: 'Permission Denied',
      status: 403
    });
  }
  const networkObj = await network.connectToNetwork(req.decoded.user);

  const response = await network.query(networkObj, 'GetAllScores');

  if (!response.success) {
    return res.json({
      success: false,
      msg: response.msg.toString()
    });
  }
  return res.json({
    success: true,
    scores: JSON.parse(response.msg)
  });
});

module.exports = router;
