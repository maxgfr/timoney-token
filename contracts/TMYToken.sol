pragma solidity 0.4.21;

import 'zeppelin-solidity/contracts/token/MintableToken.sol';

contract TMYToken is MintableToken {
    string public name = "Timoney";
    string public symbol = "TMY";
    uint8 public decimals = 18;
}
