# Crowdtrac
 
1.	Install GIt, cURL, Docker and Docker compose (https://hyperledger-fabric.readthedocs.io/zh_CN/latest/prereqs.html).
2.	Install Fabric V2.2 (https://hyperledger-fabric.readthedocs.io/en/latest/install.html) and Node.js (https://github.com/nvm-sh/nvm#installation).
3.	Enter the corresponding folder “covid”
4.	Start the Fabric network:
	bash ./network-clean.sh
	bash ./network-starter.sh
5.	Install the smart contract to the channel as “division”:
	cd organization/division/
	source division.sh
	peer lifecycle chaincode package cp.tar.gz --lang node --path ./contract --label cp_0
	peer lifecycle chaincode install cp.tar.gz  //The command will return the PACKAGE_ID, which is used in the next step.
	export PACKAGE_ID={PACKAGE_ID}	
	peer lifecycle chaincode approveformyorg --orderer localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name papercontract -v 0 --package-id $PACKAGE_ID --sequence 1 --tls --cafile $ORDERER_CA
	
6.	Install the smart contract to the channel as “center”:
	Open a new shell window.
	cd covid/organization/center/
	source center.sh 
	peer lifecycle chaincode package cp.tar.gz --lang node --path ./contract --label cp_0
	peer lifecycle chaincode install cp.tar.gz  //The command will return the PACKAGE_ID, which is used in the next step.
	export PACKAGE_ID={PACKAGE_ID}	
	peer lifecycle chaincode approveformyorg --orderer localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name papercontract -v 0 --package-id $PACKAGE_ID --sequence 1 --tls --cafile $ORDERER_CA
7.	Commit the chaincode definition to the channel:
	Open the shell window of “center”
	peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --peerAddresses localhost:7051 --tlsRootCertFiles ${PEER0_ORG1_CA} --peerAddresses localhost:9051 --tlsRootCertFiles ${PEER0_ORG2_CA} --channelID mychannel --name papercontract -v 0 --sequence 1 --tls --cafile $ORDERER_CA --waitForEvent
8.	Create a user in “division”:
	Open the shell window of “division”
	cd covid/organization/division/application
	npm i --unsafe-perm --verbose install
	node addToWallet.js
9.	Run the alert history webpage:
	cd covid/organization/division/application
	export FLASK_APP=views.py
	flask run --host=0.0.0.0
10.	Run the administrative control webpage:
	cd covid/organization/division/application
	streamlit run POTENTIAL_INFECTION_ALERT.py
