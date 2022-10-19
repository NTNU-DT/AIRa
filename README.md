## AIRa - *An automated infection risk assessment platform for an indoor environment*

## 1. Introduction

Indoor air quality is an important parameter for the protection of occupants in an indoor environment. AIRa is an automated infection risk assessment tool for the indoor air quality management of buildings. AIRa was built on the open-source blockchain technology, [Hyperledger](https://www.hyperledger.org/), which integrates the state-of-the-art infection risk assessment methods, [Wells-Riley](https://en.wikipedia.org/wiki/Wells-Riley_model), for estimating potential risks of virus spread. It can detect access the risk in near real time and send alert messages to the public and building managers.



## 2. Online demo

#### Administrative interface: [http://47.254.152.209:8501](http://47.254.152.209:8501)

#### Alert historical messages: [http://47.254.152.209:5000](http://47.254.152.209:5000)

## 3. Installation

1. Install GIt, cURL, Docker and Docker compose (https://hyperledger-fabric.readthedocs.io/zh_CN/latest/prereqs.html).

2. Install Fabric V2.2 (https://hyperledger-fabric.readthedocs.io/en/latest/install.html) and Node.js (https://github.com/nvm-sh/nvm#installation).

3. Enter the corresponding folder “AIRa”

4. Start the Fabric network:

   ```setup
   bash organization/network-starter.sh
   ```

5. Install the smart contract to the channel:

   ```setup
   cd organization/division/
   source division.sh
   peer lifecycle chaincode package cp.tar.gz --lang node --path ./contract --label cp_0
   peer lifecycle chaincode install cp.tar.gz  //The command will return the PACKAGE_ID, which is used in the next step.
   export PACKAGE_ID={PACKAGE_ID}	
   peer lifecycle chaincode approveformyorg --orderer localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name papercontract -v 0 --package-id $PACKAGE_ID --sequence 1 --tls --cafile $ORDERER_CA
   ```

6. Install the smart contract to the channel for another node:
   Open a new shell window

   ```setup
   cd AIRa/organization/center/
   source center.sh 
   peer lifecycle chaincode package cp.tar.gz --lang node --path ./contract --label cp_0
   peer lifecycle chaincode install cp.tar.gz  //The command will return the PACKAGE_ID, which is used in the next step.
   export PACKAGE_ID={PACKAGE_ID}	
   peer lifecycle chaincode approveformyorg --orderer localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name papercontract -v 0 --package-id $PACKAGE_ID --sequence 1 --tls --cafile $ORDERER_CA
   ```

7. Commit the chaincode definition to the channel:
   Open the shell window

   ```setup
   peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --peerAddresses localhost:7051 --tlsRootCertFiles ${PEER0_ORG1_CA} --peerAddresses localhost:9051 --tlsRootCertFiles ${PEER0_ORG2_CA} --channelID mychannel --name papercontract -v 0 --sequence 1 --tls --cafile $ORDERER_CA --waitForEvent
   ```

8. Create a user in “division” node:
   Open the shell window of “division”

   ```setup
   cd AIRa/organization/division/application
   npm install
   node addToWallet.js
   ```

9. Run the alert history webpage:

   ```setup
   cd AIRa/organization/division/application
   export FLASK_APP=views.py
   flask run --host=0.0.0.0
   ```

10. Run the administrative control webpage:

    ```setup
    cd AIRa/organization/division/application
    streamlit run POTENTIAL_INFECTION_ALERT.py
    ```

## 4. Publications
