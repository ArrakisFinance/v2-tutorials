import hre, { ethers } from "hardhat";
import { sleep } from "../src/utils";
import { BigNumber } from "ethers";

import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "../.env" });
const maxFeeGlobal = process.env.MAX_FEE_OVERRIDE;
const maxPriorityFeeGlobal = process.env.MAX_PRIORITY_FEE_OVERRIDE;
const swapRouterABI = [
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "tokenIn", type: "address" },
          { internalType: "address", name: "tokenOut", type: "address" },
          { internalType: "int24", name: "tickSpacing", type: "int24" },
          { internalType: "address", name: "recipient", type: "address" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "uint256", name: "amountIn", type: "uint256" },
          {
            internalType: "uint256",
            name: "amountOutMinimum",
            type: "uint256",
          },
          {
            internalType: "uint160",
            name: "sqrtPriceLimitX96",
            type: "uint160",
          },
        ],
        internalType: "struct ISwapRouter.ExactInputSingleParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "exactInputSingle",
    outputs: [{ internalType: "uint256", name: "amountOut", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
];

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

  const token0 = "0x4200000000000000000000000000000000000006";
  const token1 = "0x4eeD0d2deb4C588393c80869B122327581B0D98e";
  const sqrtPriceLimitX96 = "17499072790755600000000000";
  const tickSpacing = 200;
  const amountIn = "103341";

  const tokenIn = token1;
  const tokenOut = token0;

  // const router = await ethers.getContractAt(swapRouterABI, "0xc6D25285D5C5b62b7ca26D6092751A145D50e9Be", user);
  const router = await ethers.getContractAt(
    swapRouterABI,
    "0xBE6D8f0d05cC4be24d5167a3eF062215bE6D18a5",
    user
  );
  // const router = await ethers.getContractAt(swapRouterABI, "0x2626664c2603336E57B271c5C0b26F421741e481", user);
  const params = {
    tokenIn,
    tokenOut,
    tickSpacing,
    deadline: Math.floor(Date.now() / 1000 + 30),
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
