'use strict';

const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const path = require('path');
const fs = require('fs');

const util = require('util');

const ccpPath = path.resolve(
  __dirname,
  '../../..',
  'certificate-network',
  'connection-academy.json'
);

exports.connectToNetwork = async function(userName) {
  const gateway = new Gateway();

  try {
    const walletPath = path.join(process.cwd(), './academy/wallet');
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
      if (args) {
        args = JSON.parse(args[0]);
        args = JSON.stringify(args);
        let response = await networkObj.contract.submitTransaction(func, args);

        await networkObj.gateway.disconnect();
        return response;
      } else {
        let response = await networkObj.contract.submitTransaction(func);

        await networkObj.gateway.disconnect();
        return response;
      }
    }
  } catch (error) {
    return error;
  }
};

exports.registerTeacher = async function(TeacherID) {
  if (!teacherId) {
    let response = {};
    response.error = 'Error! You need to fill all fields before you can register!';
    return response;
  }

  try {
    const walletPath = path.join(process.cwd(), './academy/wallet');
    const wallet = new FileSystemWallet(walletPath);

    const userExists = await wallet.exists(TeacherID);
    if (userExists) {
      console.log(`An identity for the user ${TeacherID} already exists in the wallet`);
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

    const secret = await ca.register(
      {
        affiliation: '',
        enrollmentID: TeacherID,
        role: 'client',
        attrs: [{ name: 'TeacherID', value: TeacherID, ecert: true }]
      },
      adminIdentity
    );
    const enrollment = await ca.enroll({ enrollmentID: TeacherID, enrollmentSecret: secret });
    const userIdentity = X509WalletMixin.createIdentity(
      'AcademyMSP',
      enrollment.certificate,
      enrollment.key.toBytes()
    );
    await wallet.import(TeacherID, userIdentity);
    console.log(
      `Successfully registered and enrolled admin user ${TeacherID} and imported it into the wallet`
    );

    await gateway.disconnect();
  } catch (error) {
    console.error(`Failed to register user ${TeacherID}: ${error}`);
    process.exit(1);
  }
};
