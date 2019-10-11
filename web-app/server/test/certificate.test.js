process.env.NODE_DEV = 'test';

const expect = require('chai').expect;
const request = require('supertest');
const chai = require('chai');
const Cert = require('../models/Cert');
const sinon = require('sinon');
const network = require('../fabric/network');
const USER_ROLES = require('../configs/constant').USER_ROLES;
const test = require('sinon-test')(sinon, { useFakeTimers: false });

const app = require('../app');

require('dotenv').config();

describe('Route : /certificate', () => {
  describe('# GET /certificate/:certid ', () => {
    let findOneStub;
    let findStub;

    beforeEach(() => {
      findOneStub = sinon.stub(Cert, 'findOne');
      findStub = sinon.stub(Cert, 'find');
    });

    afterEach(() => {
      findOneStub.restore();
      findStub.restore();
    });

    it('should get data success', (done) => {
      findOneStub.yields(undefined, {
        certificateID: '5d9ac9e4fc93231bc694cb4c',
        SubjectID: 'Blockchain',
        username: 'tantv',
        issueDate: 'Mon Oct 07 2019 00:07:17 GMT+0700 (Indochina Time)'
      });

      request(app)
        .get('/certificate/5d9ac9e4fc93231bc694cb4c')
        .then((res) => {
          expect(res.status).equal(200);
          expect(res.body.success).equal(true);
          done();
        });
    });
  });
});
