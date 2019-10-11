process.env.NODE_DEV = 'test';

const expect = require('chai').expect;
const request = require('supertest');
const sinon = require('sinon');
const network = require('../fabric/network');
const User = require('../models/User');
const test = require('sinon-test')(sinon, { useFakeTimers: false });

const app = require('../app');
require('dotenv').config();

describe('Routes /subject/create', () => {
  describe('#GET /subject/create', () => {
    it(
      'should be success login routes',
      test((done) => {
        request(app)
          .get('/subject/create')
          .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
          .then((res) => {
            expect(res.body.success).equal(true);
            done();
          });
      })
    );

    it(
      'permission denied with student because it is not admin academy',
      test((done) => {
        request(app)
          .get('/subject/create')
          .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
          .then((res) => {
            expect(res.body.success).equal(false);
            expect(res.body.msg).equal('Permission Denied');
            expect(res.body.status).equal(403);
            done();
          });
      })
    );

    it(
      'permission denied with teacher because it is not admin academy',
      test((done) => {
        request(app)
          .get('/subject/create')
          .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
          .then((res) => {
            expect(res.body.success).equal(false);
            expect(res.body.msg).equal('Permission Denied');
            expect(res.body.status).equal(403);
            done();
          });
      })
    );

    it(
      'permission denied with admin student because it is not admin academy',
      test((done) => {
        request(app)
          .get('/subject/create')
          .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
          .then((res) => {
            expect(res.body.success).equal(false);
            expect(res.body.msg).equal('Permission Denied');
            expect(res.body.status).equal(403);
            done();
          });
      })
    );
  });

  describe('#POST /subject/create', () => {
    let connect;
    let createSubjectStub;
    let findOneUserStub;

    beforeEach(() => {
      connect = sinon.stub(network, 'connectToNetwork');
      createSubjectStub = sinon.stub(network, 'createSubject');
      findOneUserStub = sinon.stub(User, 'findOne');
    });

    afterEach(() => {
      connect.restore();
      createSubjectStub.restore();
      findOneUserStub.restore();
    });

    it(
      'should be invalid if subjectName is empty',
      test((done) => {
        request(app)
          .post('/subject/create')
          .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
          .send({
            subjectname: ''
          })
          .then((res) => {
            expect(res.body.success).equal(false);
            expect(res.body.status).equal(422);
            done();
          });
      })
    );

    it(
      'should create subject success',
      test((done) => {
        connect.returns({ error: null });
        createSubjectStub.returns({ success: true, msg: 'subject is created' });
        request(app)
          .post('/subject/create')
          .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
          .send({
            subjectname: 'Hyperledger Fabric'
          })
          .then((res) => {
            expect(res.body.success).equal(true);
            done();
          });
      })
    );

    it(
      'fail create subject because error connect to blockchain',
      test((done) => {
        connect.returns(null);
        request(app)
          .post('/subject/create')
          .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
          .send({
            subjectname: 'Hyperledger Fabric'
          })
          .then((res) => {
            expect(res.body.success).equal(false);
            expect(res.body.status).equal(500);
            done();
          });
      })
    );

    it(
      'fail create subject because error call to chaincode',
      test((done) => {
        createSubjectStub.returns({ success: false, msg: 'error' });
        request(app)
          .post('/subject/create')
          .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
          .send({
            subjectname: 'Hyperledger Fabric'
          })
          .then((res) => {
            expect(res.body.success).equal(false);
            done();
          });
      })
    );
  });
});

describe('#GET /subject/all', () => {
  let connect;
  let query;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
    query.withArgs('GetAllSubjects');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
  });

  it(
    'should return all subjects',
    test((done) => {
      connect.returns({ error: null });
      query.returns({
        success: true,
        msg: [
          {
            SubjectID: '00',
            Name: 'Blockchain',
            TeacherUsername: 'GV00',
            Students: ['Tan', 'Nghia']
          },
          {
            SubjectID: '01',
            Name: 'Sawtooth',
            TeacherUsername: 'GV01',
            Students: ['Tan', 'Nghia', 'Quang']
          }
        ]
      });
      request(app)
        .get('/subject/all')
        .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
        .expect(200)
        .then((res) => {
          expect(res.status).equal(200);
          expect(res.body.success).equal(true);
          done();
        });
    })
  );

  it(
    'fail get all subjects because err connect to blockchain',
    test((done) => {
      connect.returns(null);
      request(app)
        .get('/subject/all')
        .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
        .then((res) => {
          expect(res.body.success).equal(false);
          expect(res.body.status).equal(500);
          expect(res.body.msg).equal('Failed to connect blockchain');
          done();
        });
    })
  );
});

describe('#GET /subject/:id', () => {
  let connect;
  let query;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
    query.withArgs('QuerySubject');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
  });

  it(
    'should return subject',
    test((done) => {
      connect.returns({ error: null });
      query.returns({
        success: true,
        msg: { SubjectID: '00', Name: 'Blockchain', TeacherUsername: 'GV00' }
      });
      request(app)
        .get('/subject/00')
        .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
        .then((res) => {
          expect(res.body.success).equal(true);
          done();
        });
    })
  );

  it(
    'fail query subject because call chaincode error ',
    test((done) => {
      connect.returns({ error: null });
      query.returns({ success: false, msg: 'err' });
      request(app)
        .get('/subject/fabric')
        .then((res) => {
          expect(res.body.success).equal(false);
          done();
        });
    })
  );
});
