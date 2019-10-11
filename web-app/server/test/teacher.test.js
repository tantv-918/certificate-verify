process.env.NODE_DEV = 'test';

const expect = require('chai').expect;
const request = require('supertest');
const User = require('../models/User');
const USER_ROLES = require('../configs/constant').USER_ROLES;
const sinon = require('sinon');
const network = require('../fabric/network');
const test = require('sinon-test')(sinon, { useFakeTimers: false });

const app = require('../app');
require('dotenv').config();

describe('Route /account/teacher', () => {
  describe('#POST /account/teacher/create', () => {
    let findOneUserStub;
    let saveUserStub;
    let registerTeacherStub;
    let connect;

    beforeEach(() => {
      connect = sinon.stub(network, 'connectToNetwork');
      findOneUserStub = sinon.stub(User, 'findOne');
      saveUserStub = sinon.stub(User.prototype, 'save');
      registerTeacherStub = sinon.stub(network, 'registerTeacherOnBlockchain');
    });

    afterEach(() => {
      connect.restore();
      findOneUserStub.restore();
      saveUserStub.restore();
      registerTeacherStub.restore();
    });

    it('should be invalid if username and name is empty', (done) => {
      request(app)
        .post('/account/teacher/create')
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .send({
          username: '',
          fullname: ''
        })
        .then((res) => {
          expect(res.body.success).equal(false);
          expect(res.body.status).equal(422);
          done();
        });
    });

    it('should create success', (done) => {
      findOneUserStub.yields(undefined, null);
      connect.returns({ error: null });
      registerTeacherStub.returns({ success: true, msg: 'success create teacher' });

      request(app)
        .post('/account/teacher/create')
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .send({
          username: 'thienthangaycanh',
          fullname: 'Tan Trinh'
        })
        .then((res) => {
          expect(res.status).equal(200);
          expect(res.body.success).equal(true);
          done();
        });
    });

    it('should fail because the username already exists.', (done) => {
      findOneUserStub.yields(undefined, {
        username: 'thienthangaycanh',
        fullname: 'Tan Trinh'
      });

      request(app)
        .post('/account/teacher/create')
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .send({
          username: 'thienthangaycanh',
          fullname: 'Tan Trinh'
        })
        .then((res) => {
          expect(res.status).equal(409);
          done();
        });
    });
  });

  describe('#GET /all', () => {
    let connect;
    let query;
    let findOneUserStub;
    let allUserStub;

    beforeEach(() => {
      connect = sinon.stub(network, 'connectToNetwork');
      query = sinon.stub(network, 'query');
      findOneUserStub = sinon.stub(User, 'findOne');
      allUserStub = sinon.stub(User, 'find');

      query.withArgs('GetAllTeachers');
    });

    afterEach(() => {
      connect.restore();
      query.restore();
      allUserStub.restore();
      findOneUserStub.restore();
    });

    it('should return all teachers.', (done) => {
      query.returns({
        success: true,
        msg: [
          {
            id: 1,
            username: 'GV01',
            role: USER_ROLES.TEACHER
          },
          {
            id: 2,
            username: 'GV02',
            role: USER_ROLES.TEACHER
          },
          {
            id: 3,
            username: 'GV03',
            role: USER_ROLES.TEACHER
          }
        ]
      });

      request(app)
        .get('/account/teacher/all')
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(200);
          expect(res.body.success).equal(true);
          done();
        });
    });

    it('fail return all teachers.', (done) => {
      query.returns({
        success: false,
        msg: 'ERROR'
      });

      request(app)
        .get('/account/teacher/all')
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(200);
          expect(res.body.success).equal(false);
          done();
        });
    });
  });
});

describe('#POST /account/teacher/score', () => {
  let connect;
  let createScore;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    createScore = sinon.stub(network, 'createScore');
  });

  afterEach(() => {
    connect.restore();
    createScore.restore();
  });

  it(
    'success create score with role teacher',
    test((done) => {
      connect.returns({ error: null });
      createScore.returns({ success: true, msg: 'Create success' });
      request(app)
        .post('/account/teacher/score')
        .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
        .send({
          subjectid: '02',
          studentusername: 'tan',
          score: 9.5
        })
        .then((res) => {
          expect(res.status).equal(200);
          expect(res.body.success).equal(true);
          done();
        });
    })
  );

  it(
    'fail create score with role teacher',
    test((done) => {
      connect.returns({ error: null });
      createScore.returns({ success: false, msg: 'Error' });
      request(app)
        .post('/account/teacher/score')
        .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
        .send({
          subjectid: '02',
          studentusername: 'tan',
          score: 9.5
        })
        .then((res) => {
          expect(res.status).equal(200);
          expect(res.body.success).equal(false);
          done();
        });
    })
  );

  it(
    'do not success create score with req.body.score is not Float',
    test((done) => {
      connect.returns({ error: null });
      request(app)
        .post('/account/teacher/score')
        .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
        .send({
          subjectid: '02',
          studentusername: 'tan',
          score: '<script>alert("hacked");</script>'
        })
        .then((res) => {
          expect(res.body.success).equal(false);
          expect(res.body.status).equal(422);
          done();
        });
    })
  );

  it(
    'do not success create score with req.body is empty',
    test((done) => {
      connect.returns({ error: null });
      request(app)
        .post('/account/teacher/score')
        .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
        .send({
          subjectid: '02',
          studentusername: '',
          score: ''
        })
        .then((res) => {
          expect(res.body.success).equal(false);
          expect(res.body.status).equal(422);
          done();
        });
    })
  );

  it(
    'do not success create score with role admin academy',
    test((done) => {
      connect.returns({ error: null });
      request(app)
        .post('/account/teacher/score')
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .send({
          subjectid: '02',
          studentusername: 'tan',
          score: 10
        })
        .then((res) => {
          expect(res.body.success).equal(false);
          expect(res.body.status).equal(403);
          done();
        });
    })
  );

  it(
    'do not success create score with role student',
    test((done) => {
      connect.returns({ error: null });
      request(app)
        .post('/account/teacher/score')
        .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
        .send({
          subjectid: '02',
          studentusername: 'tantv',
          score: 10.0
        })
        .then((res) => {
          expect(res.body.success).equal(false);
          expect(res.body.status).equal(403);
          done();
        });
    })
  );
});
