pragma solidity ^0.4.18;

import './BurnableToken.sol';
import './Ownable.sol';

contract TMYToken is BurnableToken, Ownable {

    string public constant name = "TimeMoney";
    string public constant symbol = "TMY";
    uint public constant decimals = 18;
    uint256 public constant initialSupply = 300000000 * (10 ** uint256(decimals));

    // Constructor
    function TMYToken() {
        totalSupply = initialSupply;
        balances[msg.sender] = initialSupply; // Send all tokens to owner
    }
}
