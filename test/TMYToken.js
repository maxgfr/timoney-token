var TMYToken = artifacts.require("./TMYToken.sol"),
  Crowdsale = artifacts.require("./Crowdsale.sol");

var eth  = web3.eth,
  owner  = eth.accounts[0],
  wallet = eth.accounts[1],
  buyer  = eth.accounts[2],
  buyer2 = eth.accounts[3],
  totalTokensSold  = 0,
  buyerTokenBalance  = 0,
  buyer2TokenBalance = 0;

  var totalSupply       = 300000000,
      totalTokenForSale = 195000000,
      // preICO tokens will be kept in owner wallet until distributed
      preIcoTokensSold  = 59692413, // need to be set when presale is over
      maxCap            = totalTokenForSale - preIcoTokensSold,
      reserveAmount     = totalSupply - totalTokenForSale;

const timeTravel = function (time) {
    return new Promise((resolve, reject) => {
        web3.currentProvider.sendAsync({
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [time], // 86400 is num seconds in day
            id: new Date().getTime()
        }, (err, result) => {
            if(err){ return reject(err) }
                return resolve(result)
            });
    })
}

const mineBlock = function () {
    return new Promise((resolve, reject) => {
        web3.currentProvider.sendAsync({
            jsonrpc: "2.0",
            method: "evm_mine"
        }, (err, result) => {
            if(err){ return reject(err) }
            return resolve(result)
        });
    })
}

var printBalance = async function() {
    const ownerBalance = web3.eth.getBalance(owner);
    const walletBalance = web3.eth.getBalance(wallet);
    const buyerBalance = web3.eth.getBalance(buyer);
    const crowdsaleBalance = web3.eth.getBalance(Crowdsale.address);

    let token = await TMYToken.deployed();
    let balance = await token.balanceOf.call(owner);
    console.log("Owner balance: ", web3.fromWei(ownerBalance, "ether").toString(), " ETHER / ", web3.fromWei(balance.valueOf(), "ether").toString(), " TMYT");
    balance = await token.balanceOf.call(buyer);
    console.log("Buyer balance: ", web3.fromWei(buyerBalance, "ether").toString(), " ETHER / ", web3.fromWei(balance.valueOf(), "ether").toString(), " TMYT");
    balance = await token.balanceOf.call(Crowdsale.address);
    console.log("Crowdsale balance: ", web3.fromWei(crowdsaleBalance, "ether").toString(), " ETHER / ", web3.fromWei(balance.valueOf(), "ether").toString(), " TMYT");
    balance = await token.balanceOf.call(wallet);
    console.log("Wallet balance: ", web3.fromWei(walletBalance, "ether").toString(), " ETHER / ", web3.fromWei(balance.valueOf(), "ether").toString(), " TMYT");
}

contract('ICO', function(accounts) {
    var investEther = async function(sum, from) {
        var investSum = web3.toWei(sum, "ether");

        let ico = await Crowdsale.deployed();
        let txn = await ico.sendTransaction({from: from, to: ico.address, value: investSum});
        let token = await TMYToken.deployed();
        let balance = await token.balanceOf.call(from);
        return balance;
    }

    it("Should remain "+ preIcoTokensSold +" TMYToken in the first account", async function() {
        await printBalance();
        let token = await TMYToken.deployed();
        let balance = await token.balanceOf.call(owner);
        assert.equal(web3.fromWei(balance.valueOf()), preIcoTokensSold, preIcoTokensSold + " wasn't in the first account");
    });

    it("Should have "+ maxCap +" TMYToken in Crowdsale contract", async function() {
        let token = await TMYToken.deployed();
        let balance = await token.balanceOf.call(Crowdsale.address);
        assert.equal(web3.fromWei(balance.valueOf()), maxCap, maxCap + " wasn't in the Crowdsale account")
  });

  it("Should not deposit less than 0.001 ETH", async function() {
      try {
          let balance = await investEther(0.0001, buyer);
      } catch (e) {
          return true;
      }

      throw new Error("I should never see this!")
  });

  it("Should Buy 2400 tokens + 12% on week 1 -> 2688 tokens", async function() {
      let balance = await investEther(1, buyer);
      totalTokensSold += 2688000000000000000000;
      buyerTokenBalance += 2688000000000000000000;
      assert.equal(balance.valueOf(), buyerTokenBalance, "5448 wasn't in the buyer account.");
  });

  it("Should Buy 2400 tokens + 9% on week 2 -> 2616 tokens", async function() {
      await timeTravel(86400 * 7); // 1 day later
      await mineBlock(); // workaround for https://github.com/ethereumjs/testrpc/issues/336
      let balance = await investEther(1, buyer);
      totalTokensSold += 2616000000000000000000;
      buyerTokenBalance += 2616000000000000000000;
      assert.equal(balance.valueOf(), buyerTokenBalance, "8064 wasn't in the buyer account.");
  });

  it("Should Buy 2400 tokens + 6% on week 3 -> 2544 tokens", async function() {
      await timeTravel(86400 * 7); // 1 day later
      await mineBlock(); // workaround for https://github.com/ethereumjs/testrpc/issues/336
      let balance = await investEther(1, buyer);
      totalTokensSold += 2544000000000000000000;
      buyerTokenBalance += 2544000000000000000000;
      assert.equal(balance.valueOf(), buyerTokenBalance, "10608 wasn't in the buyer account.");
  });

  it("Should Buy 2400 tokens + 3% on week 4 -> 2472 tokens", async function() {
      await timeTravel(86400 * 7); // 1 day later
      await mineBlock(); // workaround for https://github.com/ethereumjs/testrpc/issues/336
      let balance = await investEther(1, buyer);
      totalTokensSold += 2472000000000000000000;
      buyerTokenBalance += 2472000000000000000000;
      assert.equal(balance.valueOf(), buyerTokenBalance, "13080 wasn't in the buyer account.");
  });

  it("Should Buy 2400 tokens without any bonus after week 4", async function() {
      await timeTravel(86400 * 7); // 1 day later
      await mineBlock(); // workaround for https://github.com/ethereumjs/testrpc/issues/336
      let balance = await investEther(1, buyer);
      totalTokensSold += 2400000000000000000000;
      buyerTokenBalance += 2400000000000000000000;
      assert.equal(balance.valueOf(), buyerTokenBalance, "15480 wasn't in the buyer account.");
  });


  it("Should Buy 24000 tokens from buyer", async function() {
      await timeTravel(86400 * 1); // 1 day later
      await mineBlock(); // workaround for https://github.com/ethereumjs/testrpc/issues/336
      let balance = await investEther(25, buyer);
      totalTokensSold += 60000000000000000000000;
      buyerTokenBalance += 60000000000000000000000;
      assert.equal(balance.valueOf(), buyerTokenBalance, "40000 wasn't in the buyer2 account.");
  });

  it("Should Buy 48000 tokens from buyer2", async function() {
      await timeTravel(86400 * 1); // 1 day later
      await mineBlock(); // workaround for https://github.com/ethereumjs/testrpc/issues/336
      let balance = await investEther(20, buyer2);
      totalTokensSold += 48000000000000000000000;
      buyer2TokenBalance += 48000000000000000000000;
      assert.equal(balance.valueOf(), buyer2TokenBalance, "48000 wasn't in the buyer2 account.");
  });

  it("Should transfer 1000 tokens from buyer to buyer2", async function() {
      let token = await TMYToken.deployed();
      let txn = await token.transfer(buyer2, 1000000000000000000000, {from: buyer});
      let balance = await token.balanceOf.call(buyer);
      let balance2 = await token.balanceOf.call(buyer2);
      buyerTokenBalance -= 1000000000000000000000;
      buyer2TokenBalance += 1000000000000000000000;
      assert.equal(balance.valueOf(), buyerTokenBalance, "1000 TMYT wasn't removed from buyer account.");
      assert.equal(balance2.valueOf(), buyer2TokenBalance, "1000 TMYT wasn't transfered to buyer2 account.");
  });


  it("Should not Buy tokens after ICO end date", async function() {
      await timeTravel(86400 * 200); // 200 days later
      await mineBlock(); // workaround for https://github.com/ethereumjs/testrpc/issues/336
      try {
          let balance = await investEther(1, buyer);
      } catch (e) {
          return true;
      }

      throw new Error("I should never see this!")
  });

  it("Should burn the remaining tokens", async function() {
      let token = await TMYToken.deployed();
      let ico = await Crowdsale.deployed();

      let txn = await ico.finalizeCrowdsale({from: owner});
      let balance = await token.balanceOf.call(Crowdsale.address);


      assert.equal(balance.valueOf(), 0, "Crowdsale contract still have tokens.");
      await printBalance();
  });


});
