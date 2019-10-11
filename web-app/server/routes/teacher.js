const router = require('express').Router();
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network');
const User = require('../models/User');
const { check, validationResult, sanitizeParam } = require('express-validator');

router.get('/create', async (req, res) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    res.json({
      success: false,
      msg: 'Failed'
    });
  } else {
    res.json({
      hello: 'new teacher'
    });
  }
});

router.post(
  '/create',
  [
    check('username')
      .not()
      .isEmpty()
      .trim()
      .escape(),

    check('fullname')
      .not()
      .isEmpty()
      .trim()
      .escape()
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ success: false, errors: errors.array(), status: 422 });
    }

    if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
      res.json({
        success: false,
        msg: 'Failed'
      });
    } else {
      User.findOne({ username: req.body.username }, async (err, existing) => {
        if (err) throw next(err);
        if (existing) {
          res.json({
            success: false,
            msg: 'Teacher username is exist'
          });
        } else {
          let createdUser = {
            username: req.body.username,
            fullname: req.body.fullname
          };
          const networkObj = await network.connectToNetwork(req.decoded.user);

          if (!networkObj) {
            res.json({
              success: false,
              msg: 'Failed',
              status: 500
            });
          }
          const response = await network.registerTeacherOnBlockchain(networkObj, createdUser);
          if (response.success) {
            let teachers = await network.query(networkObj, 'GetAllTeachers');
            res.json({
              success: true,
              msg: response.msg,
              teachers: JSON.parse(teachers.msg)
            });
          } else {
            res.json({
              success: false,
              msg: response.msg
              // token: token
            });
          }
        }
      });
    }
  }
);

router.post(
  '/score',
  check('subjectId')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  check('studentusername')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  check('score')
    .not()
    .isEmpty()
    .isFloat(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ success: false, errors: errors.array(), status: 422 });
    }

    if (req.decoded.user.role !== USER_ROLES.TEACHER) {
      res.json({
        success: false,
        msg: 'Permission Denied',
        status: 403
      });
    } else {
      const user = req.decoded.user;

      const studentusername = req.body.studentusername;
      const subjectId = req.body.subjectId;
      const score = req.body.score;

      let networkObj = await network.connectToNetwork(user);

      if (!networkObj) {
        res.json({
          success: false,
          msg: 'Failed',
          status: 500
        });
      }

      let response = await network.createScore(networkObj, subjectId, studentusername, score);

      if (!response.success) {
        res.json({
          success: false,
          msg: 'Error create score',
          status: 500
        });
      } else {
        res.json({
          success: true,
          msg: 'Create score success'
        });
      }
    }
  }
);

router.get('/all', async (req, res, next) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    res.json({
      success: false,
      msg: 'Failed'
    });
  } else {
    const networkObj = await network.connectToNetwork(req.decoded.user);
    const response = await network.query(networkObj, 'GetAllTeachers');
    if (response.success) {
      res.json({
        success: true,
        teachers: JSON.parse(response.msg)
      });
    } else {
      res.json({
        success: false,
        msg: response.msg.toString()
      });
    }
  }
});

router.get(
  '/:username',
  [
    sanitizeParam('username')
      .trim()
      .escape()
  ],
  async (req, res, next) => {
    if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
      res.json({
        success: false,
        msg: 'Failed'
      });
    } else {
      var username = req.params.username;

      User.findOne({ username: username, role: USER_ROLES.TEACHER }, async (err, teacher) => {
        if (err) {
          res.json({
            success: false,
            msg: err
          });
        } else {
          const networkObj = await network.connectToNetwork(req.decoded.user);
          const response = await network.query(networkObj, 'QueryTeacher', username);
          if (response.success) {
            let subjects = await network.query(
              networkObj,
              'GetSubjectsByTeacher',
              teacher.username
            );
            res.json({
              success: true,
              msg: response.msg.toString(),
              subjects: JSON.parse(subjects.msg)
            });
          } else {
            res.json({
              success: false,
              msg: response.msg.toString()
            });
          }
        }
      });
    }
  }
);

router.get('/:username/subjects', async (req, res, next) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    res.status(403).json({
      success: false,
      msg: 'Permission Denied',
      status: '422'
    });
  } else {
    await User.findOne({ username: req.params.username }, async (err, teacher) => {
      if (err) throw err;
      else {
        const networkObj = await network.connectToNetwork(req.decoded.user);
        let subjectsByTeacher = await network.query(
          networkObj,
          'GetSubjectsByTeacher',
          teacher.username
        );
        let subjects = await network.query(networkObj, 'GetAllSubjects');
        let subjectsNoTeacher = JSON.parse(subjects.msg).filter(
          (subject) => subject.TeacherUsername === ''
        );

        if (subjectsByTeacher.success && subjects.success) {
          res.json({
            success: true,
            subjects: JSON.parse(subjectsByTeacher.msg),
            subjectsNoTeacher: subjectsNoTeacher
          });
        } else {
          res.json({
            success: false,
            msg: subjectsByTeacher.msg.toString()
          });
        }
      }
    });
  }
});

module.exports = router;
