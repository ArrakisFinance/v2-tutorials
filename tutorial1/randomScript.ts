import hre, { ethers } from "hardhat";
import { sleep } from "../src/utils";
import { BigNumber } from "ethers";

import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "../.env" });
const maxFeeGlobal = process.env.MAX_FEE_OVERRIDE;
const maxPriorityFeeGlobal = process.env.MAX_PRIORITY_FEE_OVERRIDE;
const swapRouterABI = JSON.parse(
  readFileSync("./abis/ISwapRouter.json", { encoding: "utf-8" })
);

async function main() {
  const [user] = await ethers.getSigners();

  const feeData =
    Number(maxFeeGlobal) > 0 && Number(maxPriorityFeeGlobal) > 0
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
  const maxFeePerGas: BigNumber = feeData.maxFeePerGas;
  const maxPriorityFeePerGas: BigNumber = feeData.maxPriorityFeePerGas;
  if (
    hre.network.name === "mainnet" ||
    hre.network.name === "polygon" ||
    hre.network.name === "optimism" ||
    hre.network.name === "arbitrum" ||
    hre.network.name === "gnosis" ||
    hre.network.name === "goerli"
  ) {
    console.log(
      `Gas Info:\nMaxFeePerGas: ${Number(
        ethers.utils.formatUnits(maxFeePerGas, "gwei")
      ).toFixed(1)} gwei\nMaxPriorityFeePerGas: ${Number(
        ethers.utils.formatUnits(maxPriorityFeePerGas, "gwei")
      ).toFixed(1)} gwei\n\n\n    sleeping for 10 seconds\n\n`
    );
    await sleep(10000);
  }

  const token0 = "0x010700AB046Dd8e92b0e3587842080Df36364ed3";
  const token1 = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
  const sqrtPriceLimitX96 = "7674080986523207000000000000";
  const fee = 10000;
  const amountIn = "1506389874375693";

  const tokenIn = token1;
  const tokenOut = token0;

  // const router = await ethers.getContractAt(swapRouterABI, "0xc6D25285D5C5b62b7ca26D6092751A145D50e9Be", user);
  const router = await ethers.getContractAt(
    swapRouterABI,
    "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
    user
  );
  // const router = await ethers.getContractAt(swapRouterABI, "0x2626664c2603336E57B271c5C0b26F421741e481", user);
  const params = {
    tokenIn,
    tokenOut,
    fee,
    recipient: user.address,
    amountIn,
    amountOutMinimum: 0,
    sqrtPriceLimitX96,
  };
  console.log("approving...");
  const token = await ethers.getContractAt("IERC20", tokenIn, user);
  const tx0 = await token.approve(router.address, amountIn);
  await tx0.wait();
  console.log("swapping...");
  await router.estimateGas.exactInputSingle(params);
  const tx = await router.exactInputSingle(params);
  console.log("tx hash:", tx.hash);
  await tx.wait();
  console.log("Complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });