// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;

import {
    IArrakisV2
} from "@arrakisfi/v2-core/contracts/interfaces/IArrakisV2.sol";

interface IArrakisV2Extended is IArrakisV2 {
    function setRestrictedMint(address) external;

    function restrictedMint() external view returns (address);
}
