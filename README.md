# V2 Tutorials

## Tutorial 1: Basic Multiposition Management

In this tutorial we walk through usage of an ArrakisV2 "private vault" - meaning as a solo LP managing their personal Uniswap V3 liquidity positions (for the case of this tutorial, on the DAI/WETH token pair).

### Step 1: Setup Environment

1. clone repository: `git clone https://github.com/ArrakisFinance/v2-tutorials.git`
2. enter repository: `cd v2-tutorials`
3. download dependencies: `yarn` (don't have yarn? see [here](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable))
4. create `.env` file: `touch .env`
5. fill in `ALCHEMY_ID` variable in the `.env` file (don't have an alchemy api key? see [here](https://www.alchemy.com/))
6. compile contracts: `yarn compile`
7. choose the network and address you want to use for this tutorial (need a wallet? get metamask [here](https://metamask.io/)).
8. fill in `PK` variable in the `.env` file with hexadecimal private key for your address, `0x` prefixed (how to export metamask private key? see [here](https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-export-an-account-s-private-key#:~:text=On%20the%20account%20page%2C%20click,click%20%E2%80%9CConfirm%E2%80%9D%20to%20proceed.))

Finally, if you face issues with gas pricing in subsequent steps, you can manually override gas prices by optionally adding `MAX_FEE_OVERRIDE` and `MAX_PRIORITY_FEE_OVERRIDE` variables in the `.env` file.

Your `.env` file may now look something like this (in this case, manually forcing a 40 gwei gas price):

```
ALCHEMY_ID=aaaaaaaaaaaaaaaaaaaaaaaaaaaa
PK=0xffffffffffffffffffffffffffffffffffffffffffffffffffffffff
MAX_FEE_OVERRIDE=40000000000
MAX_PRIORITY_FEE_OVERRIDE=40000000000
```

### Step 2: Create ArrakisV2 Vault Instance

First, fund your chosen address from Step 1 with some network tokens (Polygon = MATIC, Ethereum Mainnet = ETH, Goerli = GoETH etc). You'll also need 1 DAI in your address on that network (Make sure it is correct DAI address for the relevant network see `src/addresses.ts` to verify).

Now we will run a command to initialize a private ArrakisV2 Vault on the DAI/WETH token pair and deposit an initial 1 DAI into the vault:

```
yarn tutorial1-init --network goerli
```

Congrats! You instantiated a private ArrakisV2 vault on matic mainnet. At the end of the script you should see the address of your newly created DAI/WETH vault, and you can verify that 1 DAI was deposited in there.

### Step 3: Fund vault with DAI and WETH

Copy the vault address output in Step 2. This is your ArrakisV2 "private vault" **ON THE NETWORK YOU RAN THE STEP 2 SCRIPT**. I repeat: **ON ALL OTHER NETWORKS SENDING TOKENS TO THE VAULT ADDRESS WILL RESULT IN TOTAL LOSS OF FUNDS**

Connect your wallet to the network on which you deployed your vault and simply Transfer some WETH and DAI to the vault address -- (you should verify WETH and DAI ERC20 addresses on your network in `src/addresses` **DO NOT TRANSFER ANY OTHER ERC20 TOKENS TO THIS ADDRESS OR THEY WILL BE LOST**). For the purposes of the tutorial, try to make it close to 50/50 in dollar value if you can! (e.g. transfer $5 worth of WETH to the vault and 4 DAI + 1 DAI already deposited in Step 1)

NOTE: Your wallet may throw a warning here, which makes sense since **YOU SHOULD NEVER SEND TOKENS DIRECTLY TO AN ERC20 CONTRACT ADDRESS UNLESS YOU KNOW WHAT YOU ARE DOING** but in this particular case it happens to be safe. As long as you are the sole owner of the entire supply of this Arrakis LP token you can retreive all DAI and WETH holdings from the vault or any of its Uniswap V3 liquidity positions by burning the LP token supply. **NOT THE CASE FOR ARRAKIS LP TOKENS WITH MULTIPLE DISTINCT SHAREHOLDERS WHERE SENDING TOKENS DIRECTLY TO THE CONTRACT WOULD DISTRIBUTE THOSE TOKENS PROPORTIONALLY OVER ALL HOLDERS**

### Step 4: Monitor your position

Check out the full details of your position with:

```
yarn tutorial1-status --network goerli
```

You should see that all of the tokens you deposited in the vault in previous steps, and that they are "leftover" since you havent created any liquidity positions yet.

### Step 5: Set liquidity position

To deposit liquidity into Uniswap V3 LP positions initially, run this command:

```
yarn tutorial1-setPosition --network goerli
```

Congrats! You just placed your first two LP positions on two different fee tiers via your ArrakisV2 vault.

### Step 6: Monitor your position

Check out the full details of your position with:

```
yarn tutorial1-status --network goerli
```

You should now see your new Uniswap V3 liquiidty positions.

### Step 7: Reposition liquidity

Wait some time (ideally for prices to move a bit, if on testnet like goerli you'd have to do some swaps yourself to generate some fees and move the price)

Then you could reposition your liquidity around the new current price with:

```
yarn tutorial1-resetPosition --network goerli
```

These removes the two existing liquidity positions and repalces them with two new ones centered around the new market price.

### Step 8: Monitor your position

Check out the full details of your position after adjusting the position with:

```
yarn tutorial1-status --network goerli
```

### Finish Tutorial: Withdraw all your DAI and WETH

Get all your DAI and WETH tokens back with:

```
yarn tutorial1-withdraw --network goerli
```
