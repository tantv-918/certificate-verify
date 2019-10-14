const router = require('express').Router();
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network');
const { check, validationResult, sanitizeParam } = require('express-validator');
const User = require('../models/User');
const checkJWT = require('../middlewares/check-jwt');
const uuidv4 = require('uuid/v4');

router.get('/create', async (req, res) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    res.json({
      success: false,
      msg: 'Permission Denied',
      status: 403
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
    check('subjectname')
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

    if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
      return res.json({
        success: false,
        msg: 'Permission Denied',
        status: 403
      });
    }
    let subject = {
      subjectID: uuidv4(),
      subjectName: req.body.subjectname
    };
    const networkObj = await network.connectToNetwork(req.decoded.user);
    const response = await network.createSubject(networkObj, subject);
    if (response.success) {
      const listNew = await network.query(networkObj, 'GetAllSubjects');
      return res.json({
        success: true,
        subjects: JSON.parse(listNew.msg)
      });
    }
    return res.json({
      success: false,
      msg: response.msg
    });
  }
);

router.post(
  '/addsubjectforteacher',
  checkJWT,
  [
    check('teacherusername')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('subjectId')
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

    if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
      return res.json({
        success: false,
        msg: 'Permission Denied',
        status: 403
      });
    }
    User.findOne(
      { username: req.body.teacherusername, role: USER_ROLES.TEACHER },
      async (err, teacher) => {
        if (err) throw err;
        if (teacher) {
          const networkObj = await network.connectToNetwork(req.decoded.user);
          const response = await network.registerTeacherForSubject(
            networkObj,
            req.body.subjectId,
            req.body.teacherusername
          );
          if (response.success) {
            let subjects = await network.query(
              networkObj,
              'GetSubjectsByTeacher',
              teacher.username
            );
            return res.json({
              success: true,
              msg: response.msg,
              subjects: JSON.parse(subjects.msg)
            });
          }
          return res.json({
            success: false,
            msg: response.msg
          });
        }
      }
    );
  }
);

router.get('/all', async (req, res, next) => {
  await User.findOne({ username: req.decoded.user.username }, async (err, user) => {
    if (err) throw err;
    else {
      const networkObj = await network.connectToNetwork(user);

      const response = await network.query(networkObj, 'GetAllSubjects');

      if (response.success) {
        return res.json({
          success: true,
          subjects: JSON.parse(response.msg)
        });
      }
      return res.json({
        success: false,
        msg: response.msg.toString()
      });
    }
  });
});

router.get('/subjecjtsnoteacher', checkJWT, async (req, res, next) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    return res.json({
      success: false,
      msg: 'Permission Denied',
      status: 403
    });
  }
  const networkObj = await network.connectToNetwork(req.decoded.user);
  let subjects = await network.query(networkObj, 'GetAllSubjects');
  subjectsNoTeacher = JSON.parse(subjects.msg).filter((subject) => subject.TeacherUsername === '');

  if (subjects.success) {
    return res.json({
      success: true,
      subjects: subjectsNoTeacher
    });
  }
  return res.json({
    success: false,
    msg: subjects.msg.toString()
  });
});

router.get('/:subjectId', async (req, res, next) => {
  await User.findOne({ username: req.decoded.user.username }, async (err, user) => {
    const subjectID = req.params.subjectId;
    const networkObj = await network.connectToNetwork(user);
    const response = await network.query(networkObj, 'QuerySubject', subjectID);
    if (response.success) {
      return res.json({
        success: true,
        msg: response.msg.toString()
      });
    }
    return res.json({
      success: false,
      msg: response.msg.toString()
    });
  });
});

router.get('/:subjectId/students', checkJWT, async (req, res, next) => {
  await User.findOne({ username: req.decoded.user }, async (err, user) => {
    if (err) throw err;
    else {
      const subjectID = req.params.subjectId;
      const networkObj = await network.connectToNetwork(req.decoded.user);
      const response = await network.query(networkObj, 'GetStudentsBySubject', subjectID);

      if (response.success) {
        return res.json({
          success: true,
          students: JSON.parse(response.msg)
        });
      }
      return res.json({
        success: false,
        msg: response.msg.toString()
      });
    }
  });
});

router.get('/:subjectId/scores', checkJWT, async (req, res, next) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    return res.json({
      success: false,
      msg: 'Permission Denied',
      status: 403
    });
  }
  await User.findOne({ username: req.decoded.user }, async (err, user) => {
    if (err) throw err;
    else {
      const subjectId = req.params.subjectId;
      const networkObj = await network.connectToNetwork(user);
      const response = await network.query(networkObj, 'GetScoresBySubject', subjectId);

      if (response.success) {
        return res.json({
          success: true,
          scores: JSON.parse(response.msg)
        });
      }
      return res.json({
        success: false,
        msg: response.msg.toString()
      });
    }
  });
});

router.get('/:subjectId/certificates', checkJWT, async (req, res, next) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    return res.json({
      success: false,
      msg: 'Permission Denied',
      status: 403
    });
  }
  await User.findOne({ username: req.decoded.user }, async (err, user) => {
    if (err) throw err;
    else {
      const subjectId = req.params.subjectId;
      const networkObj = await network.connectToNetwork(user);
      const response = await network.query(networkObj, 'GetCertificatesBySubject', subjectId);

      if (response.success) {
        return res.json({
          success: true,
          certificates: JSON.parse(response.msg)
        });
      }
      return res.json({
        success: false,
        msg: response.msg.toString()
      });
    }
  });
});

module.exports = router;
