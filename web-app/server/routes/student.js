const router = require('express').Router();
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network.js');
const { validationResult, sanitizeParam, check } = require('express-validator');
const User = require('../models/User');
const checkJWT = require('../middlewares/check-jwt');

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
  let identity = req.params.username;
  await User.findOne({ username: identity, role: USER_ROLES.STUDENT }, async (err, student) => {
    if (err) {
      return res.json({ success: false, msg: 'error query subjects of student' });
    }

    if (!student) {
      return res.json({ success: false, msg: 'student is not exists' });
    }

    const networkObj = await network.connectToNetwork(req.decoded.user);
    let subjectsByStudent = await network.query(networkObj, 'GetSubjectsByStudent', identity);
    if (!subjectsByStudent.success) {
      return res.json({
        success: false,
        msg: subjectsByStudent.msg.toString()
      });
    }
    return res.json({
      success: true,
      subjects: JSON.parse(subjectsByStudent.msg)
    });
  });
});

router.get('/:username/scores', async (req, res, next) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    return res.json({
      success: false,
      msg: 'Permission Denied',
      status: 403
    });
  }
  let identity = req.params.username;
  await User.findOne({ username: identity, role: USER_ROLES.STUDENT }, async (err, student) => {
    if (err) {
      return res.json({ success: false, msg: 'error query scores of student' });
    }

    if (!student) {
      return res.json({ success: false, msg: 'student is not exists' });
    }

    const networkObj = await network.connectToNetwork(req.decoded.user);
    let scoresByStudent = await network.query(networkObj, 'GetScoresByStudent', identity);
    if (!scoresByStudent.success) {
      return res.json({
        success: false,
        msg: scoresByStudent.msg.toString()
      });
    }
    return res.json({
      success: true,
      scores: JSON.parse(scoresByStudent.msg)
    });
  });
});

router.get('/:username/certificates', async (req, res, next) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    return res.json({
      success: false,
      msg: 'Permission Denied',
      status: 403
    });
  }
  let identity = req.params.username;
  await User.findOne({ username: identity, role: USER_ROLES.STUDENT }, async (err, student) => {
    if (err) {
      return res.json({ success: false, msg: 'error query certificates of student' });
    }

    if (!student) {
      return res.json({ success: false, msg: 'student is not exists' });
    }

    const networkObj = await network.connectToNetwork(req.decoded.user);
    let certificatesByStudent = await network.query(
      networkObj,
      'GetCertificatesByStudent',
      identity
    );
    if (!certificatesByStudent.success) {
      return res.json({
        success: false,
        msg: certificatesByStudent.msg.toString()
      });
    }
    return res.json({
      success: true,
      certificates: JSON.parse(certificatesByStudent.msg)
    });
  });
});

module.exports = router;
