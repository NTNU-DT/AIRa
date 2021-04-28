'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const yaml = require('js-yaml');
const { Wallets, Gateway } = require('fabric-network');


// Main program function
async function main() {

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
        console.log('Use network channel');

        const network = await gateway.getNetwork('mychannel');

        // Get addressability to commercial paper contract
        console.log('Use alert smart contract.');

        const contract = await network.getContract('papercontract', 'org.papernet.commercialpaper');

        // queries - commercial paper
        console.log('-----------------------------------------------------------------------------------------');
        console.log('****** Submitting alert queries ****** \n\n ');

	console.log('0. Query Unendorsed  Alert ');
	console.log('-----------------------------------------------------------------------------------------\n');
			

	let queryResponse0 = await contract.evaluateTransaction('queryEndorser', 'division');

	let json = JSON.parse(queryResponse0.toString());
	console.log(json);
	console.log('\n\n');
	console.log('\n  Unendorsed alert  query  complete.');
	console.log('-----------------------------------------------------------------------------------------\n\n');

        // 1 Division query
        console.log('1. Query  Endorsed Alerts ');
        console.log('-----------------------------------------------------------------------------------------\n');
        let queryResponse2 = await contract.evaluateTransaction('queryEndorser', 'center');
        json = JSON.parse(queryResponse2.toString());
        console.log(json);

        console.log('\n\n');
        console.log('\n  Endorsed alert  query complete.');
        console.log('-----------------------------------------------------------------------------------------\n\n');


        
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

    console.log('Query program complete.');

}).catch((e) => {

    console.log('Query program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);

});
