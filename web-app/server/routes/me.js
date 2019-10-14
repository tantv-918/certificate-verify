const router = require('express').Router();
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network.js');
const User = require('../models/User');
const { check, validationResult, sanitizeParam } = require('express-validator');

router.get('/', async (req, res) => {
  const user = req.decoded.user;

  if (user.role === USER_ROLES.STUDENT) {
    const networkObj = await network.connectToNetwork(user);

    if (!networkObj) {
      return res.json({
        success: false,
        msg: 'Failed connect to blockchain',
        status: 500
      });
    }

    const response = await network.query(networkObj, 'QueryStudent', user.username);
    if (!response.success) {
      return res.json({
        success: false,
        msg: response.msg
      });
    }
    return res.json({
      success: true,
      username: response.msg.Username,
      fullname: response.msg.Fullname
    });
  }
  if (user.role === USER_ROLES.TEACHER) {
    const networkObj = await network.connectToNetwork(user);

    if (!networkObj) {
      return res.json({
        success: false,
        msg: 'Failed connect to blockchain',
        status: 500
      });
    }

    const response = await network.query(networkObj, 'QueryTeacher', user.username);

    if (!response.success) {
      return res.json({
        success: false,
        msg: response.msg.toString()
      });
    }
    return res.json({
      success: true,
      username: response.msg.Username,
      fullname: response.msg.Fullname
    });
  }

  if (user.role === USER_ROLES.ADMIN_ACADEMY) {
    return res.json({ success: true, username: admin.username, role: admin.role });
  }
});

router.get('/subjects', async (req, res) => {
  const user = req.decoded.user;

  if (user.role === USER_ROLES.STUDENT) {
    const networkObj = await network.connectToNetwork(user);

    if (!networkObj) {
      return res.json({
        success: false,
        msg: 'Failed connect to blockchain',
        status: 500
      });
    }

    const response = await network.query(networkObj, 'GetMySubjects');

    if (!response.success) {
      return res.json({
        success: false,
        msg: response.msg.toString()
      });
    }
    return res.json({
      success: true,
      subjects: JSON.parse(response.msg)
    });
  }
  if (user.role === USER_ROLES.TEACHER) {
    const networkObj = await network.connectToNetwork(user);

    if (!networkObj) {
      return res.json({
        success: false,
        msg: 'Failed connect to blockchain',
        status: 500
      });
    }

    const response = await network.query(networkObj, 'GetSubjectsByTeacher', user.username);

    if (!response.success) {
      return res.json({
        success: false,
        msg: response.msg.toString()
      });
    }
    return res.json({
      success: true,
      subjects: JSON.parse(response.msg)
    });
  }
  return res.json({
    success: true,
    msg: 'You do not have subject'
  });
});

router.get(
  '/subjects/:subjectId/scores',
  [
    sanitizeParam('subjectId')
      .trim()
      .escape()
  ],
  async (req, res) => {
    const user = req.decoded.user;
    if (user.role === USER_ROLES.TEACHER) {
      const networkObj = await network.connectToNetwork(user);
      var subjectID = req.params.subjectId;

      if (!networkObj) {
        return res.json({
          success: false,
          msg: 'Failed connect to blockchain',
          status: 500
        });
      }

      const response = await network.query(networkObj, 'GetScoresBySubjectOfTeacher', subjectID);

      if (!response.success) {
        return res.json({
          success: false,
          scores: JSON.parse(response.msg)
        });
      }
      return res.json({
        success: true,
        subjects: response.msg.toString()
      });
    }
    return res.json({
      success: true,
      msg: 'You do not have subject'
    });
  }
);

router.get('/certificates', async (req, res) => {
  const user = req.decoded.user;

  if (user.role === USER_ROLES.STUDENT) {
    const networkObj = await network.connectToNetwork(user);

    if (!networkObj) {
      return res.json({
        success: false,
        msg: 'Failed connect to blockchain',
        status: 500
      });
    }

    const response = await network.query(networkObj, 'GetMyCerts');

    if (!response.success) {
      return res.json({
        success: false,
        certificates: JSON.parse(response.msg)
      });
    }
    return res.json({
      success: true,
      msg: response.msg.toString()
    });
  }
  return res.json({
    success: true,
    msg: 'You are not student'
  });
});

router.get('/scores', async (req, res) => {
  const user = req.decoded.user;

  if (user.role === USER_ROLES.STUDENT) {
    const networkObj = await network.connectToNetwork(user);

    if (!networkObj) {
      return res.json({
        success: false,
        msg: 'Failed connect to blockchain',
        status: 500
      });
    }

    const response = await network.query(networkObj, 'GetMyScores');

    if (!response.success) {
      return res.json({
        success: false,
        scores: JSON.parse(response.msg)
      });
    }
    return res.json({
      success: true,
      msg: response.msg
    });
  }
  return res.json({
    success: true,
    msg: 'You are not student'
  });
});

router.post(
  '/registersubject',
  [
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

    if (req.decoded.user.role !== USER_ROLES.STUDENT) {
      return res.json({
        success: false,
        msg: 'Permission Denied',
        status: 403
      });
    }
    const networkObj = await network.connectToNetwork(req.decoded.user);
    const response = await network.registerStudentForSubject(networkObj, req.body.subjectId);
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
  }
);

router.get('/createscore', async (req, res) => {
  if (req.decoded.user.role !== USER_ROLES.TEACHER) {
    return res.json({
      success: false,
      msg: 'Permission Denied',
      status: 403
    });
  }
  return res.json({
    success: true
  });
});

router.post(
  '/createscore',
  [
    (check('subjectId')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('studentUsername')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check('scoreValue')
      .not()
      .isEmpty()
      .trim()
      .escape())
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array(), status: '422' });
    }

    if (req.decoded.user.role !== USER_ROLES.TEACHER) {
      return res.json({
        success: false,
        msg: 'Permission Denied',
        status: 403
      });
    }
    User.findOne(
      { username: req.body.studentusername, role: USER_ROLES.STUDENT },
      async (err, student) => {
        if (err) throw next(err);
        if (student) {
          let score = {
            subjectID: req.body.subjectId,
            studentUsername: req.body.studentUsername,
            scoreValue: req.body.scoreValue
          };
          const networkObj = await network.connectToNetwork(req.decoded.user);
          const response = await network.createScore(networkObj, score);
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
        }
      }
    );
  }
);

module.exports = router;
