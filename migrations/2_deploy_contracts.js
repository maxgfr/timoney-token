var TMYToken = artifacts.require("./TMYToken.sol");
var Crowdsale = artifacts.require("./Crowdsale.sol");

console.log('test jonjonjonjon');


module.exports = function(deployer) {
	var owner = "0xd2d767C63021500efDae9Edc51362A892D042e77";
	console.log("Owner address: " + owner);
	//wallet where ether is deposited
	//var multiSigWallet = web3.eth.accounts[1]; // change to multisig wallet address when deployed
    // ledger first address
  	var multiSigWallet = "0x7ac54982DCb42fB21b9eEc4eEA69Fa5bFF730376";

	// reserve wallet where 35% of tokens are deposited second ledger address
	var reserveWallet = "0x2Df02bb8cB3709851d72FEbE917b09DB35800D62";

	// Amount of token to transfer to crowdsale contract
	var totalSupply       = 300000000,
		  totalTokenForSale = 195000000,
			// preICO tokens will be kept in owner wallet until distributed
			preIcoTokensSold  = 59692413, // need to be set when presale is over
			maxCap            = totalTokenForSale - preIcoTokensSold,
			reserveAmount     = totalSupply - totalTokenForSale;

	console.log("Owner address: " + owner);
	console.log("multiSigWallet address: " + multiSigWallet);

    //deploy the TMYToken using the owner account
  	return deployer.deploy(TMYToken).then(function() {
  		//log the address of the TMYToken
  		console.log("TMYToken address: " + TMYToken.address);
  		//deploy the Crowdsale contract
  		return deployer.deploy(Crowdsale, TMYToken.address, multiSigWallet, web3.toWei(maxCap)).then(function() {
  			console.log("Crowdsale address: " + Crowdsale.address);
  			return TMYToken.deployed().then(function(token) {
					return Crowdsale.deployed().then(function(crowdsale) {

						// send token to crowdsale contract
						return token.transfer(Crowdsale.address, web3.toWei(maxCap)).then(function () {
							return token.balanceOf.call(Crowdsale.address).then(function (Cbalance) {

								// send reserve tokens
								return token.transfer(reserveWallet, web3.toWei(reserveAmount)).then(function () {
									return token.balanceOf.call(reserveWallet).then(function (Rbalance) {
										console.log("Crowdsale TMY balance: " + web3.fromWei(Cbalance, "ether"));
										console.log("Reserve TMY balance: " + web3.fromWei(Rbalance, "ether"));
									});
								});

                                // maybe send presale token to another wallet for distribution ?
							});
						});
  				});
  			});
  		});
	});

};
