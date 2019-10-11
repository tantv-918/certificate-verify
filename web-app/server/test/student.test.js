process.env.NODE_DEV = 'test';

const expect = require('chai').expect;
const request = require('supertest');
const sinon = require('sinon');
const User = require('../models/User');
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network');
const test = require('sinon-test')(sinon, { useFakeTimers: false });

const app = require('../app');

require('dotenv').config();

describe('GET /account/student', () => {
  describe('GET /account/student/:username', () => {
    let connect;
    let query;
    let findOneUserStub;

    beforeEach(() => {
      connect = sinon.stub(network, 'connectToNetwork');
      query = sinon.stub(network, 'query');
      findOneUserStub = sinon.stub(User, 'findOne');

      query.withArgs('QueryStudent', 'hoangdd');
    });

    afterEach(() => {
      connect.restore();
      query.restore();
      findOneUserStub.restore();
    });

    it(
      'success query student id with admin student',
      test((done) => {
        findOneUserStub.yields(undefined, {
          username: 'hoangdd',
          role: USER_ROLES.STUDENT
        });

        connect.returns({
          contract: 'academy',
          network: 'certificatechannel',
          gateway: 'gateway',
          user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
        });

        query.returns({
          success: true,
          msg: {
            Username: 'hoangdd',
            Fullname: 'Do Hoang',
            Subjects: ['1', '2']
          }
        });
        request(app)
          .get('/account/student/hoangdd')
          .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
          .then((res) => {
            expect(res.status).equal(200);
            expect(res.body.success).equal(true);
            done();
          });
      })
    );

    it(
      'fail connect to blockchain when query student ',
      test((done) => {
        findOneUserStub.yields(undefined, {
          username: 'hoangdd',
          role: USER_ROLES.STUDENT
        });

        connect.returns(null);

        query.returns({
          success: false,
          msg: 'error'
        });

        request(app)
          .get('/account/student/hoangdd')
          .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
          .then((res) => {
            expect(res.body.success).equal(false);
            expect(res.body.msg).equal('Failed connect to blockchain');
            done();
          });
      })
    );

    it(
      'do not exist student id',
      test((done) => {
        findOneUserStub.yields({ error: 'student do not exists' }, undefined);
        connect.returns({ error: null });
        query.returns({ success: false, msg: 'student do not exists' });
        request(app)
          .get('/account/student/vodanh')
          .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
          .then((res) => {
            expect(res.body.success).equal(false);
            done();
          });
      })
    );

    it(
      'sucess query student with student',
      test((done) => {
        findOneUserStub.yields(undefined, {
          username: 'tantv',
          role: USER_ROLES.STUDENT
        });

        connect.returns({
          contract: 'academy',
          network: 'certificatechannel',
          gateway: 'gateway',
          user: { username: 'tantv', role: USER_ROLES.STUDENT }
        });

        query.returns({
          success: true,
          msg: {
            Username: 'tantv',
            Fullname: 'Tan Bong Cuoi',
            Subjects: ['1', '2']
          }
        });

        request(app)
          .get('/account/student/tantv')
          .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
          .then((res) => {
            expect(res.body.success).equal(true);
            done();
          });
      })
    );
  });

  describe('GET /student/all', () => {
    let connect;
    let query;

    beforeEach(() => {
      connect = sinon.stub(network, 'connectToNetwork');
      query = sinon.stub(network, 'query');

      query.withArgs('GetAllStudents');
    });

    afterEach(() => {
      connect.restore();
      query.restore();
    });

    it(
      'success query all student with admin student',
      test((done) => {
        connect.returns({ error: null });
        query.returns({
          success: true,
          msg: [
            {
              Username: '20161010',
              Fullname: 'Tan Bong Cuoi'
            },
            {
              Username: '20156425',
              Fullname: 'Trinh Van Tan'
            }
          ]
        });
        request(app)
          .get('/account/student/all')
          .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
          .then((res) => {
            expect(res.status).equal(200);
            expect(res.body.success).equal(true);
            done();
          });
      })
    );

    it(
      'success query all student with admin academy',
      test((done) => {
        connect.returns({ error: null });
        query.returns({
          success: true,
          msg: [
            {
              Username: '20161010',
              Fullname: 'Tan Bong Cuoi'
            },
            {
              Username: '20156425',
              Fullname: 'Trinh Van Tan'
            }
          ]
        });
        request(app)
          .get('/account/student/all')
          .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
          .then((res) => {
            expect(res.status).equal(200);
            expect(res.body.success).equal(true);
            done();
          });
      })
    );

    it(
      'success query all student with teacher',
      test((done) => {
        connect.returns({ error: null });
        query.returns({
          success: true,
          msg: [
            {
              Username: '20161010',
              Fullname: 'Tan Bong Cuoi'
            },
            {
              Username: '20156425',
              Fullname: 'Trinh Van Tan'
            }
          ]
        });
        request(app)
          .get('/account/student/all')
          .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
          .then((res) => {
            expect(res.status).equal(200);
            expect(res.body.success).equal(true);
            done();
          });
      })
    );
  });
});
