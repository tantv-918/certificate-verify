const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
var checkJWT = require('../middlewares/check-jwt');

router.get('/', async (req, res) => {
  res.json({
    hello: 'auth'
  });
});

// Register
router.post(
  '/register',
  [
    // email must be an email
    check('email').isEmail(),
    // password must be at least 5 chars long
    check('password').isLength({ min: 6 }),
    // name must be at least 5 chars long
    check('name').isLength({ min: 1 })
  ],
  async (req, res, next) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // After the validation
    let user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    });

    User.findOne({ email: user.email }, async (err, existing) => {
      if (err) throw next(err);
      if (existing) {
        res.json({
          success: false,
          msg: 'Account is exits'
        });
      } else {
        // Save data
        await user.save();

        var token = jwt.sign(
          {
            user: user
          },
          'supersecret123'
        );

        res.json({
          success: true,
          msg: 'Register success',
          token: token
        });
      }
    });
  }
);

// Login
router.post(
  '/login',
  [
    // email must be an email
    check('email').isEmail(),
    // password must be at least 6 chars long
    check('password').isLength({ min: 6 })
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // After the validation
    User.findOne({ email: req.body.email }, async (err, user) => {
      if (err) throw next(err);
      if (!user) {
        res.json({
          success: false,
          msg: 'email not exits'
        });
      } else if (user) {
        var validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
          res.json({
            success: false,
            msg: 'Wrong password'
          });
        } else {
          var token = jwt.sign(
            {
              user: user
            },
            'supersecret123'
          );

          res.json({
            success: true,
            user: user.name,
            msg: 'Login success',
            token: token
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
    User.findOne({ email: req.decoded.user.email }, (err, user) => {
      if (err) return next(err);

      res.json({
        success: true,
        user: user,
        msg: 'successful'
      });
    });
  })
  .post(checkJWT, (req, res, next) => {
    User.findOne({ email: req.decoded.user.email }, async (err, user) => {
      if (err) return next(err);

      // test change name of user
      if (req.body.name) user.name = req.body.name;
      // Do something with user

      user.save();
      res.json({
        name: user.name,
        success: true,
        message: 'success'
      });
    });
  });

module.exports = router;
