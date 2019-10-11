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
  res.json({
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
        res.json({
          success: false,
          msg: 'Account is exits'
        });
      } else {
        // Save data
        let createdUser = {
          username: req.body.username,
          password: req.body.password,
          fullname: req.body.fullname
        };
        const response = await network.registerStudentOnBlockchain(createdUser);
        if (response.success) {
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
        res.json({
          success: false,
          msg: 'Username or Password incorrect'
        });
      } else if (user) {
        var validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
          res.json({
            success: false,
            msg: 'Username or Password incorrect'
          });
        } else {
          var token = jwt.sign(
            {
              user: user
            },
            secretJWT
          );

          res.json({
            success: true,
            username: req.body.username,
            user: user.name,
            msg: 'Login success',
            token: token,
            role: user.role
          });
        }
      }
    });
  }
);

// Get Profile
router
  .route('/profile')
  .get(checkJWT, (req, res, next) => {
    // get profile if send Authorization : token in headers of request
    User.findOne({ username: req.decoded.user.username }, (err, user) => {
      if (err) return next(err);

      res.json({
        success: true,
        user: user,
        msg: 'successful'
      });
    });
  })
  .post(checkJWT, (req, res, next) => {
    User.findOne({ username: req.decoded.user.username }, async (err, user) => {
      if (err) return next(err);

      // test change name of user
      if (req.body.name) {
        user.name = req.body.name;
      }
      // Do something with user

      user.save();
      res.json({
        name: user.name,
        username: req.decoded.user.username,
        success: true,
        message: 'success'
      });
    });
  });

module.exports = router;
