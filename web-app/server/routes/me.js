const router = require('express').Router();
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network.js');
const User = require('../models/User');

router.get('/', async (req, res) => {
  const user = req.decoded.user;

  if (user.role === USER_ROLES.STUDENT) {
    User.findOne({ username: user.username, role: USER_ROLES.STUDENT }, async (err, student) => {
      if (err) {
        res.json({
          success: false,
          msg: err
        });
      } else {
        const networkObj = await network.connectToNetwork(user);

        if (!networkObj) {
          res.json({
            success: false,
            msg: 'Failed connect to blockchain',
            status: 500
          });
        }

        const response = await network.query(networkObj, 'QueryStudent', user.username);
        if (!response.success) {
          res.json({
            success: false,
            msg: response.msg
          });
        } else {
          res.json({
            success: true,
            username: response.msg.Username,
            fullname: response.msg.Fullname
          });
        }
      }
    });
  } else if (user.role === USER_ROLES.TEACHER) {
    User.findOne({ username: user.username, role: USER_ROLES.TEACHER }, async (err, teacher) => {
      if (err) {
        res.json({
          success: false,
          msg: err
        });
      } else {
        const networkObj = await network.connectToNetwork(user);

        if (!networkObj) {
          res.json({
            success: false,
            msg: 'Failed connect to blockchain',
            status: 500
          });
        }

        const response = await network.query(networkObj, 'QueryTeacher', user.username);

        if (!response.success) {
          res.json({
            success: false,
            msg: response.msg
          });
        } else {
          res.json({
            success: true,
            username: response.msg.Username,
            fullname: response.msg.Fullname
          });
        }
      }
    });
  } else {
    User.findOne({ username: user.username }, async (err, admin) => {
      if (err) {
        res.json({
          success: false,
          msg: err,
          status: 500
        });
      } else if (!admin) {
        res.json({
          success: false,
          msg: 'Not Found',
          status: 404
        });
      } else {
        res.json({ success: true, username: admin.username, role: admin.role });
      }
    });
  }
});

router.get('/subject', async (req, res) => {
  const user = req.decoded.user;

  if (user.role === USER_ROLES.STUDENT) {
    User.findOne({ username: user.username, role: USER_ROLES.STUDENT }, async (err, student) => {
      if (err) {
        res.json({
          success: false,
          msg: err
        });
      } else {
        const networkObj = await network.connectToNetwork(user);

        if (!networkObj) {
          res.json({
            success: false,
            msg: 'Failed connect to blockchain',
            status: 500
          });
        }

        const response = await network.queryUserSubjects(networkObj);

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
  } else if (user.role === USER_ROLES.TEACHER) {
    User.findOne({ username: user.username, role: USER_ROLES.TEACHER }, async (err, teacher) => {
      if (err) {
        res.json({
          success: false,
          msg: err
        });
      } else {
        const networkObj = await network.connectToNetwork(user);

        if (!networkObj) {
          res.json({
            success: false,
            msg: 'Failed connect to blockchain',
            status: 500
          });
        }

        const response = await network.query(networkObj, 'GetSubjectsByTeacher', user.username);

        if (!response.success) {
          res.json({
            success: false,
            msg: response.msg.toString()
          });
        } else {
          res.json({
            success: true,
            subjects: JSON.parse(response.msg)
          });
        }
      }
    });
  } else {
    res.json({
      success: true,
      msg: 'You do not have subject'
    });
  }
});

router.get('/certificate', async (req, res) => {
  const user = req.decoded.user;

  if (user.role === USER_ROLES.STUDENT) {
    User.findOne({ username: user.username, role: USER_ROLES.STUDENT }, async (err, student) => {
      if (err) {
        res.json({
          success: false,
          msg: err
        });
      } else {
        const networkObj = await network.connectToNetwork(user);

        if (!networkObj) {
          res.json({
            success: false,
            msg: 'Failed connect to blockchain',
            status: 500
          });
        }

        const response = await network.query(networkObj, 'GetMyCerts');

        if (!response.success) {
          res.json({
            success: false,
            certificates: response.msg
          });
        } else {
          res.json({
            success: true,
            msg: response.msg
          });
        }
      }
    });
  } else {
    res.json({
      success: true,
      msg: 'You are not student'
    });
  }
});

module.exports = router;
