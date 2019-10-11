const router = require('express').Router();
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network');
const { check, validationResult, sanitizeParam } = require('express-validator');
const User = require('../models/User');
const checkJWT = require('../middlewares/check-jwt');

router.get('/create', async (req, res) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    res.status(403).json({
      success: false,
      msg: 'Permission Denied',
      status: '403'
    });
  } else {
    res.json({
      success: true
    });
  }
});

router.post(
  '/create',
  checkJWT,
  [
    (check('subjectId')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('studentusername')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('scorevalue')
      .not()
      .isEmpty()
      .trim()
      .escape())
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array(), status: '422' });
    }

    if (req.decoded.user.role !== USER_ROLES.TEACHER) {
      res.json({
        success: false,
        msg: 'Permission Denied',
        status: '422'
      });
    } else {
      User.findOne(
        { username: req.body.studentusername, role: USER_ROLES.STUDENT },
        async (err, student) => {
          if (err) throw next(err);
          if (student) {
            let score = {
              subjectID: req.body.subjectId,
              studentUsername: req.body.studentusername,
              scoreValue: req.body.scorevalue
            };
            const networkObj = await network.connectToNetwork(req.decoded.user);
            const response = await network.createScore(networkObj, score);
            if (response.success) {
              res.json({
                success: true,
                msg: response.msg
                // token: token
              });
            } else {
              res.json({
                success: false,
                msg: response.msg
                // token: token
              });
            }
          }
        }
      );
    }
  }
);

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
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(422).json({ errors: result.array(), status: '422' });
    }
    const subjectID = req.params.subjectId;
    const studentUsername = req.params.studentUsername;

    args = [subjectID, studentUsername];

    const networkObj = await network.connectToNetwork(req.decoded.user);

    const response = await network.query(networkObj, 'QueryScore', args);
    if (response.success) {
      res.json({
        success: true,
        msg: response.msg.toString()
      });
    } else {
      res.json({
        success: false,
        msg: response.msg.toString()
      });
    }
  }
);

router.get('/all', checkJWT, async (req, res) => {
  const networkObj = await network.connectToNetwork(req.decoded.user);

  const response = await network.query(networkObj, 'GetAllScores');

  if (response.success) {
    res.json({
      success: true,
      msg: response.msg.toString()
    });
  } else {
    res.json({
      success: false,
      msg: response.msg.toString()
    });
  }
});

module.exports = router;
