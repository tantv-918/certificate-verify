process.env.NODE_DEV = 'test';

const expect = require('chai').expect;
const request = require('supertest');
const User = require('../models/User');
const sinon = require('sinon');

const app = require('../app');

describe('Route : /auth', () => {
  describe('# POST :/auth/register ', () => {
    var findOneUserStub;
    var saveUserStub;

    beforeEach(() => {
      findOneUserStub = sinon.stub(User, 'findOne');
      saveUserStub = sinon.stub(User.prototype, 'save');
    });

    afterEach(() => {
      findOneUserStub.restore();
      saveUserStub.restore();
    });

    it('should be invalid if username password and name is empty', (done) => {
      request(app)
        .post('/auth/register')
        .send({
          username: '',
          password: '',
          name: ''
        })
        .then((res) => {
          expect(res.status).equal(422);
          expect(res.body.errors[0].msg).equal('Invalid value');
          done();
        });
    });

    it('should register success', (done) => {
      findOneUserStub.yields(undefined, null);

      request(app)
        .post('/auth/register')
        .send({
          username: 'hoangdd',
          password: '123456',
          name: 'Do Duc Hoang'
        })
        .then((res) => {
          expect(res.status).equal(200);
          expect(res.body.msg).equal('Register success');
          done();
        });
    });

    it('shoud fail because the username already exists.', (done) => {
      // found a record username: 'trailang98',
      findOneUserStub.yields(undefined, {
        username: 'hoangdd',
        password: '654321',
        name: '12'
      });

      request(app)
        .post('/auth/register')
        .send({
          username: 'hoangdd',
          password: '1234567',
          name: 'aasddd'
        })
        .then((res) => {
          expect(res.status).equal(200);
          expect(res.body.msg).equal('Account is exits');
          done();
        });
    });
  });

  describe('# POST :/auth/login ', () => {
    var findOneUserStub;
    beforeEach(() => {
      findOneUserStub = sinon.stub(User, 'findOne');
    });

    afterEach(() => {
      findOneUserStub.restore();
    });

    it('should be invalid if username password is empty', (done) => {
      request(app)
        .post('/auth/login')
        .send({
          username: '',
          password: ''
        })
        .then((res) => {
          expect(res.status).equal(422);
          expect(res.body.errors[0].msg).equal('Invalid value');
          done();
        });
    });

    it('shoud fail because can not find username', (done) => {
      findOneUserStub.yields(undefined, null);

      request(app)
        .post('/auth/login')
        .send({
          username: 'hoangddhaycuphoc',
          password: '1234567'
        })
        .then((res) => {
          expect(res.status).equal(200);
          expect(res.body.msg).equal('username not exits');
          done();
        });
    });

    it('shoud fail because wrong password', (done) => {
      findOneUserStub.yields(undefined, {
        username: 'hoangdd',
        password: '654321',
        name: 'hoang'
      });

      request(app)
        .post('/auth/login')
        .send({
          username: 'hoangdd',
          password: '78945612'
        })
        .then((res) => {
          expect(res.status).equal(200);
          expect(res.body.msg).equal('Wrong password');
          done();
        });
    });

    it('should login success', (done) => {
      findOneUserStub.yields(undefined, {
        username: 'hoangdd',
        password: '$2a$10$hqZtIwFcl8SLaUbxkuPOEeKqvTknWFodjVaYVdXoZ0EeIb3SjT/dG',
        name: 'alibaba'
      });

      request(app)
        .post('/auth/login')
        .send({
          username: 'hoangdd',
          password: '654321'
        })
        .then((res) => {
          expect(res.status).equal(200);
          expect(res.body.msg).equal('Login success');
          done();
        });
    });
  });
});
