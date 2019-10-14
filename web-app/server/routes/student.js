const router = require('express').Router();
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network.js');
const { validationResult, sanitizeParam, check } = require('express-validator');
const User = require('../models/User');

router.get('/all', async (req, res) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    return res.json({
      success: false,
      msg: 'Permission Denied',
      status: 403
    });
  }
  const networkObj = await network.connectToNetwork(req.decoded.user);

  const response = await network.query(networkObj, 'GetAllStudents');

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
});

router.get('/:username/subjects', async (req, res, next) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    return res.json({
      success: false,
      msg: 'Permission Denied',
      status: 403
    });
  }
  await User.findOne({ username: req.params.username }, async (err, student) => {
    if (err) throw err;
    else {
      const networkObj = await network.connectToNetwork(student.user);
      let subjectsByStudent = await network.query(
        networkObj,
        'GetSubjectsByStudent',
        student.username
      );
      if (subjectsByStudent.success) {
        return res.json({
          success: true,
          subjects: JSON.parse(subjectsByStudent.msg)
        });
      }
      return res.json({
        success: false,
        msg: subjectsByStudent.msg.toString()
      });
    }
  });
});

router.get('/:username/scores', async (req, res, next) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    return res.json({
      success: false,
      msg: 'Permission Denied',
      status: 403
    });
  } else {
    await User.findOne({ username: req.params.username }, async (err, student) => {
      if (err) throw err;
      else {
        const networkObj = await network.connectToNetwork(student.user);
        let scoresByStudent = await network.query(
          networkObj,
          'GetScoresByStudent',
          student.username
        );
        if (scoresByStudent.success) {
          return res.json({
            success: true,
            scores: JSON.parse(scoresByStudent.msg)
          });
        }
        return res.json({
          success: false,
          msg: scoresByStudent.msg.toString()
        });
      }
    });
  }
});

router.get('/:username/certificates', async (req, res, next) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    return res.json({
      success: false,
      msg: 'Permission Denied',
      status: 403
    });
  } else {
    await User.findOne({ username: req.params.username }, async (err, student) => {
      if (err) throw err;
      else {
        const networkObj = await network.connectToNetwork(student.user);
        let certificatesByStudent = await network.query(
          networkObj,
          'GetCertificatesByStudent',
          student.username
        );
        if (scoresByStudent.success) {
          return res.json({
            success: true,
            certificates: JSON.parse(certificatesByStudent.msg)
          });
        }
        return res.json({
          success: false,
          msg: scoresByStudent.msg.toString()
        });
      }
    });
  }
});

module.exports = router;
