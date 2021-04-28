/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Utility class for ledger state
const State = require('./../ledger-api/state.js');

// Enumerate commercial paper state values
const cpState = {
    ISSUED: 1,
    PENDING: 2,
    VERIFIED: 3,
    REFUTED: 4
};

/**
 * CommercialPaper class extends State class
 * Class will be used by application and smart contract to define a paper
 */
class CommercialPaper extends State {

    constructor(obj) {
        super(CommercialPaper.getClass(), [obj.issuer, obj.alertNumber ]);
        Object.assign(this, obj);
    }

    /**
     * Basic getters and setters
    */
    getIssuer() {
        return this.issuer;
    }

    setIssuer(newIssuer) {
        this.issuer = newIssuer;
    }

    getEndorser() {
        return this.endorser;
    }

    setEndorserMSP(mspid) {
        this.mspid = mspid;
    }

    getEndorserMSP() {
        return this.mspid;
    }

    setEndorser(newEndorser) {
        this.endorser = newEndorser;
    }

    /**
     * Useful methods to encapsulate commercial paper states
     */
    setIssued() {
        this.currentState = cpState.ISSUED;
    }

    setVerified() {
        this.currentState = cpState.VERIFIED;
    }

    setRefuted() {
        this.currentState = cpState.REFUTED;
    }

    setPending() {
        this.currentState = cpState.PENDING;
    }

    isIssued() {
        return this.currentState === cpState.ISSUED;
    }

    isVerified() {
        return this.currentState === cpState.VERIFIED;
    }

    isRefuted() {
        return this.currentState === cpState.REFUTED;
    }

    isPending() {
        return this.currentState === cpState.PENDING;
    }

    static fromBuffer(buffer) {
        return CommercialPaper.deserialize(buffer);
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    /**
     * Deserialize a state data to commercial paper
     * @param {Buffer} data to form back into the object
     */
    static deserialize(data) {
        return State.deserializeClass(data, CommercialPaper);
    }

    /**
     * Factory method to create a commercial paper object
     */
    static createInstance(issuer, alertNumber , issueDateTime, Value1, Value2, type) {
        return new CommercialPaper({ issuer, alertNumber , issueDateTime, Value1, Value2, type });

    }

    static getClass() {
        return 'org.papernet.commercialpaper';
    }
}

module.exports = CommercialPaper;
