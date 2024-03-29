import hre, { ethers } from "hardhat";
import { IUniswapV3Factory, IArrakisV2Factory, IArrakisV2 } from "../typechain";
import { getAddresses } from "../src/addresses";
import { sleep } from "../src/utils";
import { BigNumber } from "ethers";
import { writeFileSync } from "fs";

import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "../.env" });
const maxFeeGlobal = process.env.MAX_FEE_OVERRIDE;
const maxPriorityFeeGlobal = process.env.MAX_PRIORITY_FEE_OVERRIDE;

const addresses = getAddresses(hre.network.name);

const feeTiers = [500, 3000];
const daiToken = addresses.DAI;
const wethToken = addresses.WETH;

async function main() {
  const [user] = await ethers.getSigners();
  let feeData =
    Number(maxFeeGlobal) > 0
      ? {
          maxFeePerGas: BigNumber.from(maxFeeGlobal),
          maxPriorityFeePerGas: BigNumber.from(maxPriorityFeeGlobal),
        }
      : await user?.provider?.getFeeData();
  if (
    feeData == undefined ||
    feeData.maxFeePerGas == undefined ||
    feeData.maxPriorityFeePerGas == undefined
  ) {
    console.log("ERROR: cannot fetch fee data");
    return;
  }
  let maxFeePerGas: BigNumber = feeData.maxFeePerGas;
  let maxPriorityFeePerGas: BigNumber = feeData.maxPriorityFeePerGas;
  if (
    hre.network.name === "mainnet" ||
    hre.network.name === "polygon" ||
    hre.network.name === "optimism" ||
    hre.network.name === "arbitrum" ||
    hre.network.name === "goerli"
  ) {
    console.log(
      `Deploying new DAI/WETH vault to ${
        hre.network.name
      }\nGas Info:\nMaxFeePerGas: ${Number(
        ethers.utils.formatUnits(maxFeePerGas, "gwei")
      ).toFixed(1)} gwei\nMaxPriorityFeePerGas: ${Number(
        ethers.utils.formatUnits(maxPriorityFeePerGas, "gwei")
      ).toFixed(1)} gwei\n\n\n    sleeping for 10 seconds\n\n`
    );
    await sleep(10000);
  }
  const userAddr = await user.getAddress();

  const arrakisV2Factory = (await ethers.getContractAt(
    "IArrakisV2Factory",
    addresses.ArrakisV2Factory,
    user
  )) as IArrakisV2Factory;

  const uniswapV3Factory = (await ethers.getContractAt(
    "IUniswapV3Factory",
    addresses.UniswapV3Factory
  )) as IUniswapV3Factory;

  for (let i = 0; i < feeTiers.length; i++) {
    const poolAddr = await uniswapV3Factory.getPool(
      daiToken,
      wethToken,
      feeTiers[i].toString()
    );
    if (poolAddr == ethers.constants.AddressZero) {
      console.log("ERROR: uniswap pool at fee tier DNE");
      return;
    }
  }

  const daiTokenContract = new ethers.Contract(
    daiToken,
    [
      "function decimals() external view returns (uint8)",
      "function balanceOf(address account) public view returns (uint256)",
      "function approve(address spender, uint256 amount) external returns (bool)",
    ],
    user
  );

  const oneDai = ethers.utils.parseUnits(
    "1",
    (await daiTokenContract.decimals()).toString()
  );
  const daiTokenBal = await daiTokenContract.balanceOf(userAddr);

  if (daiTokenBal.lt(oneDai)) {
    console.log("ERROR: user acct needs 1 DAI");
    return;
  }

  const isLower = parseInt(daiToken, 16) < parseInt(wethToken, 16);
  const token0 = isLower ? daiToken : wethToken;
  const token1 = isLower ? wethToken : daiToken;
  const init0 = isLower ? oneDai : "0";
  const init1 = isLower ? "0" : oneDai;

  console.log("initializing...");
  let gasEstimate = await arrakisV2Factory.estimateGas.deployVault(
    {
      feeTiers: feeTiers,
      token0: token0,
      token1: token1,
      owner: userAddr,
      init0: init0,
      init1: init1,
      manager: userAddr,
      routers: [],
    },
    true
  );
  if (Number(maxFeeGlobal) == 0) {
    feeData = await user?.provider?.getFeeData();
  }
  if (
    feeData != undefined &&
    feeData.maxFeePerGas != undefined &&
    feeData.maxPriorityFeePerGas != undefined
  ) {
    maxFeePerGas = feeData.maxFeePerGas;
    maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
  }
  const tx = await arrakisV2Factory.deployVault(
    {
      feeTiers: feeTiers,
      token0: token0,
      token1: token1,
      owner: userAddr,
      init0: init0,
      init1: init1,
      manager: userAddr,
      routers: [],
    },
    true,
    {
      gasLimit: gasEstimate.add(BigNumber.from("20000")),
      maxFeePerGas: maxFeePerGas,
      maxPriorityFeePerGas: maxPriorityFeePerGas,
    }
  );
  console.log("tx hash:", tx.hash);
  const rc = await tx.wait();
  const event = rc?.events?.find((e) => e.event === "VaultCreated");
  // eslint-disable-next-line no-unsafe-optional-chaining
  const result = event?.args;
  const vault = result?.vault;
  if (vault == null || vault === undefined) {
    console.log("ERROR: deploying vault");
    console.log(rc);
    return;
  }

  const vaultContract = (await ethers.getContractAt(
    "IArrakisV2",
    vault,
    user
  )) as IArrakisV2;

  gasEstimate = await vaultContract.estimateGas.setRestrictedMint(userAddr);
  if (Number(maxFeeGlobal) == 0) {
    feeData = await user?.provider?.getFeeData();
  }
  if (
    feeData != undefined &&
    feeData.maxFeePerGas != undefined &&
    feeData.maxPriorityFeePerGas != undefined
  ) {
    maxFeePerGas = feeData.maxFeePerGas;
    maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
  }
  const tx2 = await vaultContract.setRestrictedMint(userAddr, {
    gasLimit: gasEstimate.add(BigNumber.from("20000")),
    maxFeePerGas: maxFeePerGas,
    maxPriorityFeePerGas: maxPriorityFeePerGas,
  });
  console.log("tx hash:", tx2.hash);
  await tx2.wait();

  const restrictedMintCheck = await vaultContract.restrictedMint();
  if (restrictedMintCheck != userAddr) {
    console.log("ERROR: restricted mint");
    return;
  }

  const supplyCheck = await vaultContract.totalSupply();
  if (Number(supplyCheck.toString()) != 0) {
    console.log("ERROR: supply should be 0");
    return;
  }

  console.log("approving...");
  gasEstimate = await daiTokenContract.estimateGas.approve(vault, oneDai);
  if (Number(maxFeeGlobal) == 0) {
    feeData = await user?.provider?.getFeeData();
  }
  if (
    feeData != undefined &&
    feeData.maxFeePerGas != undefined &&
    feeData.maxPriorityFeePerGas != undefined
  ) {
    maxFeePerGas = feeData.maxFeePerGas;
    maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
  }
  const tx3 = await daiTokenContract.approve(vault, oneDai, {
    gasLimit: gasEstimate.add(BigNumber.from("20000")),
    maxFeePerGas: maxFeePerGas,
    maxPriorityFeePerGas: maxPriorityFeePerGas,
  });
  console.log("tx hash:", tx3.hash);
  await tx3.wait();

  console.log("depositing...");
  const oneEth = ethers.utils.parseEther("1");
  gasEstimate = await vaultContract.estimateGas.mint(oneEth, userAddr);
  if (Number(maxFeeGlobal) == 0) {
    feeData = await user?.provider?.getFeeData();
  }
  if (
    feeData != undefined &&
    feeData.maxFeePerGas != undefined &&
    feeData.maxPriorityFeePerGas != undefined
  ) {
    maxFeePerGas = feeData.maxFeePerGas;
    maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
  }
  const tx4 = await vaultContract.mint(oneEth, userAddr, {
    gasLimit: gasEstimate.add(BigNumber.from("20000")),
    maxFeePerGas: maxPriorityFeePerGas,
    maxPriorityFeePerGas: maxPriorityFeePerGas,
  });
  console.log("tx hash:", tx4.hash);
  tx4.wait();

  console.log("\nStoring ArrakisV2 Vault Address:", vault);
  writeFileSync(`.tutorial1.${hre.network.name}`, vault);
  console.log("\nComplete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
