'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const yaml = require('js-yaml');
const { Wallets, Gateway } = require('fabric-network');


async function main() {

    const wallet = await Wallets.newFileSystemWallet('identity/user/Ryan/wallet');
    const gateway = new Gateway();
    try {
        const userName = 'Ryan';
        let connectionProfile = yaml.safeLoad(fs.readFileSync('../gateway/connection-org2.yaml', 'utf8'));
        let connectionOptions = {
            identity: userName,
            wallet: wallet,
            discovery: { enabled: true, asLocalhost: true }

        };
        await gateway.connect(connectionProfile, connectionOptions);
        const network = await gateway.getNetwork('mychannel');
        const contract = await network.getContract('papercontract', 'org.papernet.commercialpaper');

	let queryResponse0 = await contract.evaluateTransaction('queryEndorser', 'division');
	let json = JSON.parse(queryResponse0.toString());
	console.dir(json, {'maxArrayLength':null});

        
    } catch (error) {

    } finally {
        gateway.disconnect();

    }
}
main().then(() => {
}).catch((e) => {

    process.exit(-1);

});
