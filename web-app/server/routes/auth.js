const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
let checkJWT = require('../middlewares/check-jwt');
let secretJWT = require('../config/index').secret;
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network');

router.get('/', async (req, res) => {
  return res.json({
    hello: 'auth'
  });
});

// Register
router.post(
  '/register',
  [
    check('username')
      .not()
      .isEmpty()
      .trim()
      .escape(),

    // password must be at least 5 chars long
    check('password').isLength({ min: 6 }),
    // name must be at least 5 chars long
    check('fullname').isLength({ min: 6 })
  ],
  async (req, res, next) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    User.findOne({ username: req.body.username }, async (err, existing) => {
      if (err) throw next(err);
      if (existing) {
        return res.json({
          success: false,
          msg: 'Account is exits'
        });
      }
      // Save data
      let createdUser = {
        username: req.body.username,
        password: req.body.password,
        fullname: req.body.fullname
      };
      const response = await network.registerStudentOnBlockchain(createdUser);
      if (response.success) {
        return res.json({
          success: true,
          msg: response.msg
        });
      }
      return res.json({
        success: false,
        msg: response.msg
      });
    });
  }
);

// Login
router.post(
  '/login',
  [
    check('username')
      .not()
      .isEmpty()
      .trim()
      .escape(),

    // password must be at least 6 chars long
    check('password').isLength({ min: 6 })
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // After the validation
    User.findOne({ username: req.body.username }, async (err, user) => {
      if (err) throw next(err);
      if (!user) {
        return res.json({
          success: false,
          msg: 'Username or Password incorrect'
        });
      }
      var validPassword = await bcrypt.compare(req.body.password, user.password);
      if (!validPassword) {
        return res.json({
          success: false,
          msg: 'Username or Password incorrect'
        });
      }
      var token = jwt.sign(
        {
          user: user
        },
        secretJWT
      );

      return res.json({
        success: true,
        username: req.body.username,
        user: user.name,
        msg: 'Login success',
        token: token,
        role: user.role
      });
    });
  }
);

module.exports = router;
