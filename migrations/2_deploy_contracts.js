const TMYCrowdsale = artifacts.require('./TMYCrowdsale.sol');
const TMYToken = artifacts.require('./TMYToken.sol');

module.exports = function(deployer, network, accounts) {
    const openingTime = web3.eth.getBlock('latest').timestamp + 2; // two secs in the future
    const closingTime = openingTime + 86400 * 365; // 365 days
    const rate = new web3.BigNumber(1000);
    const wallet = accounts[1];

    return deployer
        .then(() => {
            return deployer.deploy(TMYToken);
        })
        .then(() => {
            return deployer.deploy(
                TMYCrowdsale,
                openingTime,
                closingTime,
                rate,
                wallet,
                TMYToken.address
            );
        });
};
