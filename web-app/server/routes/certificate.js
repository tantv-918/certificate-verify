const router = require('express').Router();
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network');
const { check, validationResult, sanitizeParam } = require('express-validator');
const checkJWT = require('../middlewares/check-jwt');
const Certificate = require('../models/Certificate');
const uuidv4 = require('uuid/v4');
require('dotenv').config();

router.get('/all', async (req, res) => {
  await Certificate.find(async (err, ceritificates) => {
    if (err) {
      res.json({
        success: false,
        msg: err
      });
    } else {
      res.json({
        success: true,
        msg: ceritificate
      });
    }
  });
});

router.get('/create', checkJWT, async (req, res) => {
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

router.post('/create', checkJWT, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    res.json({
      success: false,
      msg: 'Failed'
    });
  } else {
    const networkObj = await network.connectToNetwork(req.decoded.user);

    let today = new Date();
    let date = `${today.getFullYear()} - ${today.getMonth() + 1} - ${today.getDate()}`;
    let time = `${today.getHours()} : ${today.getMinutes()} : ${today.getSeconds()}`;
    let issueDate = `${date} ${time}`;

    let certificate = {
      certificateID: uuidv4(),
      subjectID: req.body.subjectid,
      studentUsername: req.body.username,
      issueDate: issueDate
    };

    const response = await network.createCertificate(networkObj, certificate);

    if (response.success == true) {
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
});

router.get('/:certid', async (req, res) => {
  let certid = req.params.certid;
  Certificate.findOne({ certificateID: certid }, async (err, ceritificate) => {
    if (err) {
      res.json({
        success: false,
        msg: err
      });
    } else {
      res.json({
        success: true,
        msg: ceritificate
      });
    }
  });
});

router.get('/:certid/verify', async (req, res) => {
  User.findOne({ username: process.env.DEFAULT_USER }, async (err, defaultUser) => {
    var certid = req.params.certid;
    Certificate.findOne({ certificateID: certid }, async (err, ceritificate) => {
      if (err) {
        res.json({
          success: false,
          msg: err
        });
      } else {
        const networkObj = await network.connectToNetwork(defaultUser);
        const response = await network.verifyCertificate(networkObj, ceritificate);

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
    });
  });
});

module.exports = router;
