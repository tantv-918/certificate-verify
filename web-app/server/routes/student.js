const router = require('express').Router();
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network.js');
const { validationResult, sanitizeParam, check } = require('express-validator');
const User = require('../models/User');

router.get('/all', async (req, res) => {
  const networkObj = await network.connectToNetwork(req.decoded.user);

  if (!networkObj) {
    res.json({
      success: false,
      msg: 'Failed connect to blockchain',
      status: 500
    });
  }

  const response = await network.query(networkObj, 'GetAllStudents');

  if (response.success == true) {
    res.json({
      success: true,
      msg: response.msg
    });
  } else {
    res.json({
      success: false,
      msg: response.msg
    });
  }

  res.status(200).send({ success: true });
});

router.get('/:username', async (req, res) => {
  var username = req.params.username;

  User.findOne({ username: username, role: USER_ROLES.STUDENT }, async (err, student) => {
    if (err) {
      res.json({
        success: false,
        msg: err
      });
    } else {
      const networkObj = await network.connectToNetwork(req.decoded.user);

      if (!networkObj) {
        res.json({
          success: false,
          msg: 'Failed connect to blockchain',
          status: 500
        });
      }

      const response = await network.query(networkObj, 'QueryStudent', username);

      if (!response.success) {
        res.json({
          success: false,
          msg: response.msg
        });
      } else {
        res.json({
          success: true,
          subjects: response.msg
        });
      }
    }
  });
});

router.post(
  '/registersubject',
  [
    check('subjectid')
      .not()
      .isEmpty()
      .trim()
      .escape()
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array(), status: '422' });
    }

    if (req.decoded.user.role !== USER_ROLES.STUDENT) {
      res.status(403).json({
        success: false,
        msg: 'Permission Denied',
        status: '422'
      });
    } else {
      User.findOne(
        { username: req.decoded.user.username, role: USER_ROLES.STUDENT },
        async (err, student) => {
          if (err) throw err;
          if (student) {
            const networkObj = await network.connectToNetwork(req.decoded.user);
            const response = await network.registerStudentForSubject(
              networkObj,
              req.body.subjectid,
              req.decoded.user.username
            );
            if (response.success == true) {
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

module.exports = router;
