pragma solidity 0.4.15;

import "./TMYToken.sol";

contract Crowdsale is Ownable {
    using SafeMath for uint256;

    // address where funds are collected
    address public multisigVault;

    TMYToken public coin;

    // start and end timestamps where investments are allowed (both inclusive)
    uint256 public startTime;
    uint256 public endTime;
    // amount of raised money in wei
    uint256 public weiRaised;
    // amount of tokens sold
    uint256 public tokensSold;
    // max amount of token for sale during ICO
    uint256 public maxCap;

    /**
    * event for token purchase logging
    * @param purchaser who paid for the tokens
    * @param beneficiary who got the tokens
    * @param value weis paid for purchase
    * @param amount of tokens purchased
    */
    event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);

    function Crowdsale(address _TMYTokenAddress, address _to, uint256 _maxCap) {
        coin = TMYToken(_TMYTokenAddress);
        multisigVault = _to;
        maxCap = _maxCap;

        // startTime = 1518651000; // new Date("Feb 14 2018 23:30:00 GMT").getTime() / 1000;
        startTime = now; // for testing we use now
        endTime = startTime + 100 days; // ICO end on Apr 30 2018 00:00:00 GMT
    }

    // fallback function can be used to buy tokens
    function () payable {
        buyTokens(msg.sender);
    }

    // allow owner to modify address of wallet
    function setMultiSigVault(address _multisigVault) public onlyOwner {
        require(_multisigVault != address(0));
        multisigVault = _multisigVault;
    }

    // compute amount of token based on 1 ETH = 2400 TMY
    function getTokenAmount(uint256 _weiAmount) internal returns(uint256) {
        // minimum deposit amount is 0.4 ETH
        if (_weiAmount < 0.001 * (10 ** 18)) {
          return 0;
        }

        uint256 tokens = _weiAmount.mul(2400);
        // compute bonus
        if(now < startTime + 7 * 1 days) {
            tokens += (tokens * 12) / 100; // 12% for first week
        } else if(now < startTime + 14 * 1 days) {
            tokens += (tokens * 9) / 100; // 9% for second week
        } else if(now < startTime + 21 * 1 days) {
            tokens += (tokens * 6) / 100; // 6% for third week
        } else if(now < startTime + 28 * 1 days) {
            tokens += (tokens * 3) / 100; // 3% for fourth week
        }

        return tokens;
    }

    // low level token purchase function
    function buyTokens(address beneficiary) payable {
        require(beneficiary != 0x0);
        require(msg.value != 0);
        require(!hasEnded());
        require(now > startTime);

        uint256 weiAmount = msg.value;
        uint256 refundWeiAmount = 0;

        // calculate token amount to be sent
        uint256 tokens = getTokenAmount(weiAmount);
        require(tokens > 0);

        // check if we are over maxCap
        if (tokensSold + tokens > maxCap) {
          // send remaining tokens to user
          uint256 overSoldTokens = (tokensSold + tokens) - maxCap;
          refundWeiAmount = weiAmount * overSoldTokens / tokens;
          weiAmount = weiAmount - refundWeiAmount;
          tokens = tokens - overSoldTokens;
        }

        // update state
        weiRaised = weiRaised.add(weiAmount);
        tokensSold = tokensSold.add(tokens);

        coin.transfer(beneficiary, tokens);
        TokenPurchase(msg.sender, beneficiary, weiAmount, tokens);
        multisigVault.transfer(weiAmount);

        // return extra ether to last user
        if (refundWeiAmount > 0) {
          beneficiary.transfer(refundWeiAmount);
        }
    }

    // @return true if crowdsale event has ended
    function hasEnded() public constant returns (bool) {
        return now > endTime || tokensSold >= maxCap;
    }

    // Finalize crowdsale buy burning the remaining tokens
    // can only be called when the ICO is over
    function finalizeCrowdsale() {
        require(hasEnded());
        require(coin.balanceOf(this) > 0);

        coin.burn(coin.balanceOf(this));
    }
}
