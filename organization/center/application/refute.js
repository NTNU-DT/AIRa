/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
*/

/*
 * This application has 6 basic steps:
 * 1. Select an identity from a wallet
 * 2. Connect to network gateway
 * 3. Access PaperNet network
 * 4. Construct request to refute alert
 * 5. Submit transaction
 * 6. Process response
 */

'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const yaml = require('js-yaml');
const { Wallets, Gateway } = require('fabric-network');
const CommercialPaper = require('../../division/contract/lib/paper.js');


var arg = process.argv;
//Main program function
async function main () {

    // A wallet stores a collection of identities for use
    const wallet = await Wallets.newFileSystemWallet('../identity/user/Paul/wallet');


    // A gateway defines the peers used to access Fabric networks
    const gateway = new Gateway();

    // Main try/catch block
    try {

        // Specify userName for network access
        const userName = 'Paul';

        // Load connection profile; will be used to locate a gateway
        let connectionProfile = yaml.safeLoad(fs.readFileSync('../gateway/connection-org1.yaml', 'utf8'));

        // Set connection options; identity and wallet
        let connectionOptions = {
            identity: userName,
            wallet: wallet,
            discovery: { enabled: true, asLocalhost: true }

        };

        // Connect to gateway using application specified parameters
        console.log('Connect to gateway.');

        await gateway.connect(connectionProfile, connectionOptions);

        // Access PaperNet network
        console.log('Use network channel.');

        const network = await gateway.getNetwork('mychannel');

        // Get addressability to commercial paper contract
        console.log('Use alert smart contract.');

        const contract = await network.getContract('papercontract', 'org.papernet.commercialpaper');

        // refute alert
        console.log('refuting.');

        const refuteResponse = await contract.submitTransaction('refute', 'division', arg[2], 'division', 'center');

        // process response
        console.log('Process refute response.');

        let paper = CommercialPaper.fromBuffer(refuteResponse);

        console.log(`${paper.issuer} alert : ${paper.alertNumber } successfully refuted by ${paper.endorser}`);
        console.log('complete.');

    } catch (error) {

        console.log(`Error. ${error}`);
        console.log(error.stack);

    } finally {

        // Disconnect from the gateway
        console.log('Disconnect from gateway.');
        gateway.disconnect();

    }
}
main().then(() => {

    console.log('Refute program complete.');

}).catch((e) => {

    console.log('Refute program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);

});
