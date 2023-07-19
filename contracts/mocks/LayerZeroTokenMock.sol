// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.7.6;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.3.0/contracts/token/ERC20/ERC20.sol";


contract LayerZeroTokenMock is ERC20 {
    constructor() ERC20("LayerZeroTokenMock", "LZTM") {
        _mint(msg.sender, 1_000_000 * 10**18);
    }
}
