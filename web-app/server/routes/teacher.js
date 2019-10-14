const router = require('express').Router();
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network');
const User = require('../models/User');
const { check, validationResult, sanitizeParam } = require('express-validator');

router.get('/create', async (req, res) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    return res.json({
      success: false,
      msg: 'Failed'
    });
  }
  return res.json({
    hello: 'new teacher'
  });
});

router.post(
  '/create',
  [
    check('username')
      .not()
      .isEmpty()
      .trim()
      .escape(),

    check('fullname').isLength({ min: 6 })
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
      return res.json({
        success: false,
        msg: 'Permission Denied',
        status: 403
      });
    }
    User.findOne({ username: req.body.username }, async (err, existing) => {
      if (err) throw next(err);
      if (existing) {
        return res.json({
          success: false,
          msg: 'Teacher username is exist'
        });
      }
      let createdUser = {
        username: req.body.username,
        fullname: req.body.fullname
      };
      const networkObj = await network.connectToNetwork(req.decoded.user);
      const response = await network.registerTeacherOnBlockchain(networkObj, createdUser);
      const teachers = await network.query(networkObj, 'GetAllTeachers');
      if (response.success && teachers.success) {
        return res.json({
          success: true,
          msg: response.msg,
          teachers: JSON.parse(teachers.msg)
        });
      }
      return res.json({
        success: false,
        msg: response.msg
      });
    });
  }
);

router.get('/all', async (req, res, next) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    return res.json({
      success: false,
      msg: 'Permission Denied',
      status: 403
    });
  }
  const networkObj = await network.connectToNetwork(req.decoded.user);
  const response = await network.query(networkObj, 'GetAllTeachers');
  if (response.success) {
    return res.json({
      success: true,
      teachers: JSON.parse(response.msg)
    });
  }
  return res.json({
    success: false,
    msg: response.msg.toString()
  });
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
      return res.json({
        success: false,
        msg: 'Permission Denied',
        status: 403
      });
    }
    var username = req.params.username;

    User.findOne({ username: username, role: USER_ROLES.TEACHER }, async (err, teacher) => {
      if (err) {
        return res.json({
          success: false,
          msg: err
        });
      }
      const networkObj = await network.connectToNetwork(req.decoded.user);
      const response = await network.query(networkObj, 'QueryTeacher', username);
      let subjects = await network.query(networkObj, 'GetSubjectsByTeacher', teacher.username);
      if (response.success || subjects.success) {
        return res.json({
          success: true,
          msg: response.msg.toString(),
          subjects: JSON.parse(subjects.msg)
        });
      }
      return res.json({
        success: false,
        msg: response.msg.toString()
      });
    });
  }
);

router.get('/:username/subjects', async (req, res, next) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    return res.json({
      success: false,
      msg: 'Permission Denied',
      status: 403
    });
  }
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
        return res.json({
          success: true,
          subjects: JSON.parse(subjectsByTeacher.msg),
          subjectsNoTeacher: subjectsNoTeacher
        });
      }
      return res.json({
        success: false,
        msg: subjectsByTeacher.msg.toString()
      });
    }
  });
});

module.exports = router;
