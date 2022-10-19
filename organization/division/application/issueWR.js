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
 * 4. Construct request to issue commercial paper
 * 5. Submit transaction
 * 6. Process response
 */

'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const yaml = require('js-yaml');
const { Wallets, Gateway } = require('fabric-network');
const CommercialPaper = require('../contract/lib/paper.js');

// Main program function
var arg = process.argv;


Date.prototype.Format = function(fmt) { 
	    var o = {
		            "M+": this.getMonth() + 1, 
		            "d+": this.getDate(),
		            "h+": this.getHours(), 
		            "m+": this.getMinutes(),
		            "s+": this.getSeconds(),
		            "S": this.getMilliseconds() 
		        };
	    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	    for (var k in o)
		        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	    return fmt;
}

function getYestoday() {
	    return new Date(new Date().getTime() - 1000 * 60 * 60 * 24).Format("yyyy-MM-dd")
}

function getToday() {
	    return new Date().Format("yyyy-MM-dd")
}

function getTomorrow() {
	    return new Date(new Date().getTime() + 1000 * 60 * 60 * 24).Format("yyyy-MM-dd")
}





async function main() {

    // A wallet stores a collection of identities for use
    const wallet = await Wallets.newFileSystemWallet('identity/user/Ryan/wallet');

    // A gateway defines the peers used to access Fabric networks
    const gateway = new Gateway();

    // Main try/catch block
    try {

        // Specify userName for network access
        const userName = 'Ryan';

        // Load connection profile; will be used to locate a gateway
        let connectionProfile = yaml.safeLoad(fs.readFileSync('../gateway/connection-org2.yaml', 'utf8'));

        // Set connection options; identity and wallet
        let connectionOptions = {
            identity: userName,
            wallet: wallet,
            discovery: { enabled:true, asLocalhost: true }
        };

        // Connect to gateway using application specified parameters
        console.log('Connect to gateway.');

        await gateway.connect(connectionProfile, connectionOptions);

        // Access PaperNet network
        console.log('Use network channel.');

        const network = await gateway.getNetwork('mychannel');

        // Get addressability to contract
        console.log('Use alert smart contract.');

        const contract = await network.getContract('papercontract');

        // issue commercial paper
        console.log('Submit alert issue.');
        let queryResponse0 = await contract.evaluateTransaction('queryEndorser', 'division');
        let json = JSON.parse(queryResponse0.toString());

        const issueResponse = await contract.submitTransaction('issue', arg[4], json.length, (new Date()).Format("yyyy-MM-dd hh:mm:ss"), 'null', arg[2], 'Probability alert');

        // process response
        console.log('Process issue response.'+issueResponse);

        let paper = CommercialPaper.fromBuffer(issueResponse);

        console.log(`${paper.issuer} alert : ${paper.alertNumber } successfully issued by ${paper.issuer}`);
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

    console.log('Issue program complete.');

}).catch((e) => {

    console.log('Issue program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);

});
