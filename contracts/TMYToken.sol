pragma solidity ^0.4.19;

import 'zeppelin-solidity/contracts/token/ERC20/MintableToken.sol';

contract TMYToken is MintableToken {
    string public name = "Timoney";
    string public symbol = "TMY";
    uint8 public decimals = 18;
}
