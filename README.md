# V2 Tutorials

## Tutorial 1: Basic Multiposition Management

In this tutorial we walk through using ArrakisV2 as a solo LP managing their personal Uniswap V3 liquidity positions on the DAI/WETH token pair.

Follow the tutorial step-by-step with detailed explanations [here](https://google.com) (T.B.D. see outline for tutorial below)

### Step 1: Setup Environment

1. clone repository: `git clone https://github.com/ArrakisFinance/v2-tutorials.git`
2. enter repository: `cd v2-tutorials`
3. download dependencies: `yarn` (don't have yarn? see [here](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable))
4. create `.env` file: `touch .env`
5. fill in `ALCHEMY_ID` variable in the `.env` file (don't have an alchemy api key? see [here](https://www.alchemy.com/))
6. compile contracts: `yarn compile`
7. choose the polygon address you want to use for this tutorial (need a wallet? get metamask [here](https://metamask.io/) add polygon rpc [here](https://wiki.polygon.technology/docs/develop/metamask/config-polygon-on-metamask/)).
8. fill in `PK` variable in the `.env` file with hexadecimal private key for your address, `0x` prefixed (how to export metamask private key? see [here](https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-export-an-account-s-private-key#:~:text=On%20the%20account%20page%2C%20click,click%20%E2%80%9CConfirm%E2%80%9D%20to%20proceed.))

Finally, if you face issues with gas pricing in subsequent steps? you can manually override gas prices by optionally adding `MAX_FEE_OVERRIDE` and `MAX_PRIORITY_FEE_OVERRIDE` variables in the `.env` file.

Your `.env` file should now look something like this (forcing a 40 gwei gas price):

```
ALCHEMY_ID=aaaaaaaaaaaaaaaaaaaaaaaaaaaa
PK=0xffffffffffffffffffffffffffffffffffffffffffffffffffffffff
MAX_FEE_OVERRIDE=40000000000
MAX_PRIORITY_FEE_OVERRIDE=40000000000
```

### Step 2: Create ArrakisV2 Vault Instance

First, fund your address from Step 1 with some MATIC (for gas costs) and at least 1 DAI, on polygon (matic) mainnet.

Now we will run a command to initialize a private ArrakisV2 Vault on the DAI/WETH token pair:

```
yarn tutorial1-init --network polygon
```

Congrats! You instantiated a private ArrakisV2 vault on matic mainnet. At the end of the script you should see the address of your newly created DAI/WETH vault, and you can verify that 1 DAI was deposited in there.

### Step 3: Fund vault with DAI and WETH

Copy the vault address output in Step 2 and transfer WETH and DAI from anywhere to the newly created vault address on matic mainnet. For the purposes of the tutorial, try to make it close to 50/50 in dollar value if you can! (e.g. transfer in 4 DAI + 1 DAI already deposited in Step 1 and transfer $5 worth of WETH)

NOTE: Your wallet may throw a warning here, which makes sense since **YOU SHOULD NEVER SEND TOKENS DIRECTLY TO AN ERC20 CONTRACT ADDRESS UNLESS YOU KNOW WHAT YOU ARE DOING** but in this particular case it happens to be safe. As long as you are the sole owner of the entire supply of this Arrakis LP token you can retreive all DAI and WETH holdings from the vault or any of its Uniswap V3 liquidity positions by burning the LP token supply. **NOT THE CASE FOR ARRAKIS LP TOKENS WITH MULTIPLE DISTINCT SHAREHOLDERS WHERE SENDING TOKENS DIRECTLY TO THE CONTRACT WOULD DISTRIBUTE THOSE TOKENS PROPORTIONALLY OVER ALL HOLDERS**

### Step 4: Monitor your position

Check out the full details of your position with

```
yarn tutorial1-status --network polygon
```

You should see that all of the tokens you deposited in the vault in previous steps, and that they are "leftover" since you havent created any liquidity positions yet.

### Step 5: Set liquidity position

To deposit liquidity into Uniswap V3 LP positions initially, run this command:

```
yarn tutorial1-setPosition --network polygon
```

Congrats! You just placed your first two LP positions on two different fee tiers via your ArrakisV2 vault.

### Step 6: Monitor your position

Check out the full details of your position with

```
yarn tutorial1-status --network polygon
```

You should now see your new Uniswap V3 liquiidty positions.

### Step 7: Reposition liquidity

Wait some time (ideally for prices to move more than 1%)

Then you could reposition your liquidity around the new current price with:

```
yarn tutorial1-resetPosition --network polygon
```

These removes the two existing liquidity positions and repalces them with two new ones.

### Step 8: Monitor your position

Check out the full details of your position with

```
yarn tutorial1-status --network polygon
```

### Finish Tutorial: Withdraw all your DAI and WETH

Get all your DAI and WETH tokens back with

```
yarn tutorial1-withdraw --network polygon
```
