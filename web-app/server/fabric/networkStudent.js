'use strict';

const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const path = require('path');
const fs = require('fs');

const util = require('util');

const ccpPath = path.resolve(
  __dirname,
  '../../..',
  'certificate-network',
  'connection-student.json'
);

exports.connectToNetwork = async function(userName) {
  const gateway = new Gateway();

  try {
    const walletPath = path.join(process.cwd(), './student/wallet');
    const wallet = new FileSystemWallet(walletPath);

    const userExists = await wallet.exists(userName);
    if (!userExists) {
      let response = {};
      response.error =
        'An identity for the user ' +
        userName +
        ' does not exist in the wallet. Register ' +
        userName +
        ' first';
      return response;
    }

    await gateway.connect(ccp, { wallet, identity: userName, discovery: gatewayDiscovery });

    // Connect to our local fabric
    const network = await gateway.getNetwork('certificatechannel');

    // Get the contract we have installed on the peer
    const contract = await network.getContract('academy');

    let networkObj = {
      contract: contract,
      network: network,
      gateway: gateway
    };

    return networkObj;
  } catch (error) {
    let response = {};
    response.error = error;
    return response;
  }
};

exports.invoke = async function(networkObj, isQuery, func, args) {
  try {
    if (isQuery === true) {
      if (args) {
        let response = await networkObj.contract.evaluateTransaction(func, args);

        await networkObj.gateway.disconnect();
        return response;
      } else {
        let response = await networkObj.contract.evaluateTransaction(func);

        await networkObj.gateway.disconnect();
        return response;
      }
    } else {
      let response = 'Student does not edit state ledger';
      await networkObj.gateway.disconnect();
      return response;
    }
  } catch (error) {
    return error;
  }
};

exports.registerStudent = async function(studentId, studentName) {
  if (!studentId || !studentName) {
    let response = {};
    response.error = 'Error! You need to fill all fields before you can register!';
    return response;
  }

  try {
    const walletPath = path.join(process.cwd(), './student/wallet');
    const wallet = new FileSystemWallet(walletPath);

    const userExists = await wallet.exists(studentId);
    if (userExists) {
      console.log(`An identity for the user ${studentId} already exists in the wallet`);
      return;
    }

    const adminExists = await wallet.exists('admin');
    if (!adminExists) {
      console.log('An identity for the admin user "admin" does not exist in the wallet');
      console.log('Run the enrollAdmin.js application before retrying');
      return;
    }

    const gateway = new Gateway();
    await gateway.connect(ccpPath, {
      wallet,
      identity: 'admin',
      discovery: { enabled: true, asLocalhost: true }
    });

    const ca = gateway.getClient().getCertificateAuthority();
    const adminIdentity = gateway.getCurrentIdentity();

    await networkObj.contract.submitTransaction('CreateStudent', studentId, studentName);

    const secret = await ca.register(
      {
        affiliation: '',
        enrollmentID: studentId,
        role: 'client',
        attrs: [{ name: 'StudentID', value: studentId, ecert: true }]
      },
      adminIdentity
    );
    const enrollment = await ca.enroll({ enrollmentID: studentId, enrollmentSecret: secret });
    const userIdentity = X509WalletMixin.createIdentity(
      'StudentMSP',
      enrollment.certificate,
      enrollment.key.toBytes()
    );

    await wallet.import(studentId, userIdentity);
  } catch (error) {
    console.error(`Failed to register student ${studentId}: ${error}`);
    process.exit(1);
  }
};
