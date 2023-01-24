# V2 Tutorials

## Tutorial 1: Basic Multiposition Management

Follow along with detailed step-by-step tutorial [here](docs.arrakis.fi/tutorials)

### Overview

In this tutorial we introduce the usage of an Arrakis V2 vault in a "private" setting, meaning as a single LP managing your personal Uniswap V3 liquidity positions on a specific token pair (in this tutorial, on the DAI/WETH token pair).

In the "private" setting, no one else but the ArrakisV2 vault owner adds or removes liquidity from the vault, making it act almost as a "proxy wallet" contract for the pair of vault tokens, a proxy optimized specifically for providing liquidity on Uniswap V3. While ArrakisV2 vaults are designed to support a more complex "public" setting, and thus come equipped with an ERC20 interface for tracking shareholdings, "private" ArrakisV2 vaults are nevertheless a useful consequence of the contract design.

When used properly, a "private" or "personal" ArrakisV2 vault can be powerful LP middleware. For someone LPing a certain token pair on Uniswap V3, the vault provides convenience and gas savings for liquidity (re)positioning market operations, especially when multiple Positions are being simultaneously managed and/or when the number and frequency of add/remove LP operations begins to increase. With ArrakisV2, LPs inventing complex and dynamic strategies for liquidity provision on Uniswap V3 have an indispensible framework for implementing and optimizing their strategies.

In this tutorial we take a detailed walkthrough of:
- properly deploying and configuring a private ArrakisV2 vault
- managing DAI/WETH liquidity on Uniswap V3 across two fee tiers (0.05%, 0.3%)

Enjoy!
