/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Fabric smart contract classes
const { Contract, Context } = require('fabric-contract-api');

// PaperNet specifc classes
const CommercialPaper = require('./paper.js');
const PaperList = require('./paperlist.js');
const QueryUtils = require('./queries.js');

/**
 * A custom context provides easy access to list of all commercial papers
 */
class CommercialPaperContext extends Context {

    constructor() {
        super();
        // All papers are held in a list of papers
        this.paperList = new PaperList(this);
    }

}

/**
 * Define commercial paper smart contract by extending Fabric Contract class
 *
 */
class CommercialPaperContract extends Contract {

    constructor() {
        // Unique namespace when multiple contracts per chaincode file
        super('org.papernet.commercialpaper');
    }

    /**
     * Define a custom context for commercial paper
    */
    createContext() {
        return new CommercialPaperContext();
    }

    /**
     * Instantiate to perform any setup of the ledger that might be required.
     * @param {Context} ctx the transaction context
     */
    async instantiate(ctx) {
        // No implementation required with this example
        // It could be where data migration is performed, if necessary
        console.log('Instantiate the contract');
    }

    /**
     * Issue commercial paper
     *
     * @param {Context} ctx the transaction context
     * @param {String} issuer commercial paper issuer
     * @param {Integer} alertNumber  paper number for this issuer
     * @param {String} issueDateTime paper issue date
     * @param {Integer} Value1 of standard
     * @param {Integer} Value2 of severity
     * @param {String} type 
    */
    async issue(ctx, issuer, alertNumber , issueDateTime, Value1, Value2, type) {

        // create an instance of the paper
        let paper = CommercialPaper.createInstance(issuer, alertNumber , issueDateTime, parseFloat(Value1), parseFloat(Value2), type);

        // Smart contract, rather than paper, moves paper into ISSUED state
        paper.setIssued();

        // save the endorser's MSP 
        let mspid = ctx.clientIdentity.getMSPID();
        paper.setEndorserMSP(mspid);

        // Newly issued paper is owned by the issuer to begin with (recorded for reporting purposes)
        paper.setEndorser("division");

        // Add the paper to the list of all similar commercial papers in the ledger world state
        await ctx.paperList.addPaper(paper);

        // Must return a serialized paper to caller of smart contract
        return paper;
    }

    /**
     * Verify alert
     */
    async verify(ctx, issuer, alertNumber , currentEndorser, newEndorser) {

        // Retrieve the current paper using key fields provided
        let paperKey = CommercialPaper.makeKey([issuer, alertNumber ]);
        let paper = await ctx.paperList.getPaper(paperKey);

        // Validate current Endorser
        if (paper.getEndorser() !== currentEndorser) {
            throw new Error('\nAlert ' + issuer + alertNumber  + ' is not issued by ' + currentEndorser);
        }

        // First buy moves state from ISSUED to VERIFIED (when running )
        if (paper.isIssued()) {
            paper.setVerified();
        }

        // Check paper
        if (paper.isVerified()) {
            paper.setEndorser(newEndorser);
            // save the owner's MSP 
            let mspid = ctx.clientIdentity.getMSPID();
            paper.setEndorserMSP(mspid);
        } else {
            throw new Error('\nAlert ' + issuer + alertNumber  + ' is not verified. Current state = ' + paper.getCurrentState());
        }

        // Update the paper
        await ctx.paperList.updatePaper(paper);
        return paper;
    }


 /**
     * Refute alert
     *
     */
    async refute(ctx, issuer, alertNumber , currentEndorser, newEndorser) {

        // Retrieve the current paper using key fields provided
        let paperKey = CommercialPaper.makeKey([issuer, alertNumber ]);
        let paper = await ctx.paperList.getPaper(paperKey);

        // Validate current Endorser
        if (paper.getEndorser() !== currentEndorser) {
            throw new Error('\nAlert ' + issuer + alertNumber  + ' is not issued by ' + currentEndorser);
        }

        // First move state from ISSUED to REFUTED (when running )
        if (paper.isIssued()) {
            paper.setRefuted();
        }
        if (paper.isRefuted()) {
            paper.setEndorser(newEndorser);
            // save the owner's MSP 
            let mspid = ctx.clientIdentity.getMSPID();
            paper.setEndorserMSP(mspid);
        } else {
            throw new Error('\nAlert ' + issuer + alertNumber  + ' is not refuted. Current state = ' + paper.getCurrentState());
        }

        // Update the paper
        await ctx.paperList.updatePaper(paper);
        return paper;
    }

    // Query transactions
    async queryHistory(ctx, issuer, alertNumber ) {

        // Get a key to be used for History query

        let query = new QueryUtils(ctx, 'org.papernet.paper');
        let results = await query.getAssetHistory(issuer, alertNumber ); // (cpKey);
        return results;

    }

    async queryEndorser(ctx, endorser) {

        let query = new QueryUtils(ctx, 'org.papernet.paper');
        let endorser_results = await query.queryKeyByEndorser(endorser);

        return endorser_results;
    }

    async queryIssuer(ctx, issuer) {

        let query = new QueryUtils(ctx, 'org.papernet.paper');
        let issuer_results = await query.queryKeyByIssuer(issuer);

        return issuer_results;
    }


    async queryPartial(ctx, prefix) {

        let query = new QueryUtils(ctx, 'org.papernet.paper');
        let partial_results = await query.queryKeyByPartial(prefix);

        return partial_results;
    }


    async queryAdhoc(ctx, queryString) {

        let query = new QueryUtils(ctx, 'org.papernet.paper');
        let querySelector = JSON.parse(queryString);
        let adhoc_results = await query.queryByAdhoc(querySelector);

        return adhoc_results;
    }

    async queryNamed(ctx, queryname) {
        let querySelector = {};
        switch (queryname) {
            case "refuted":
                querySelector = { "selector": { "currentState": "refuted" } };  // 4 = refuted state
                break;
            case "verified":
                querySelector = { "selector": { "currentState": "verified" } };  // 3 = verified state
                break;
	    case "issued":
		querySelector = { "selector": { "currentState": "issued" } };
		break;
            //case "value":
                //querySelector = { "selector": { "Value": { "$gt": 90 } } };  // to test, issue CommPapers with Value <= or => this figure.
                //break;
            default: // else, unknown named query
                throw new Error('invalid named query supplied: ' + queryname + '- please try again ');
        }

        let query = new QueryUtils(ctx, 'org.papernet.paper');
        let adhoc_results = await query.queryByAdhoc(querySelector);

        return adhoc_results;
    }

}

module.exports = CommercialPaperContract;
