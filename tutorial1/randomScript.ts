import hre, { ethers } from "hardhat";
import { sleep } from "../src/utils";
import { BigNumber } from "ethers";

import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "../.env" });
const maxFeeGlobal = process.env.MAX_FEE_OVERRIDE;
const maxPriorityFeeGlobal = process.env.MAX_PRIORITY_FEE_OVERRIDE;

async function main() {
  const [user] = await ethers.getSigners();
  let feeData =
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
  let maxFeePerGas: BigNumber = feeData.maxFeePerGas;
  let maxPriorityFeePerGas: BigNumber = feeData.maxPriorityFeePerGas;
  if (
    hre.network.name === "mainnet" ||
    hre.network.name === "polygon" ||
    hre.network.name === "optimism" ||
    hre.network.name === "arbitrum" ||
    hre.network.name === "goerli"
  ) {
    console.log(`Gas Info:\nMaxFeePerGas: ${Number(
        ethers.utils.formatUnits(maxFeePerGas, "gwei")
      ).toFixed(1)} gwei\nMaxPriorityFeePerGas: ${Number(
        ethers.utils.formatUnits(maxPriorityFeePerGas, "gwei")
      ).toFixed(1)} gwei\n\n\n    sleeping for 10 seconds\n\n`
    );
    await sleep(10000);
  }

  const router = await ethers.getContractAt("ISwapRouter", "0xE592427A0AEce92De3Edee1F18E0157C05861564", user);
  const params = {
    tokenIn: "0x15b7c0c907e4C6b9AdaAaabC300C08991D6CEA05",
    tokenOut: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    fee: "10000",
    recipient: "0x88215a2794ddC031439C72922EC8983bDE831c78",
    deadline: 9999999999,
    amountIn: ethers.utils.parseEther("50"),
    amountOutMinimum: 0,
    sqrtPriceLimitX96: "920976964015532229693250383"
  };
  console.log("approving...");
  const token = await ethers.getContractAt("IERC20", "0x15b7c0c907e4C6b9AdaAaabC300C08991D6CEA05", user);
  const tx0 = await token.approve(router.address, ethers.utils.parseEther("50"), {maxFeePerGas: maxFeePerGas, maxPriorityFeePerGas: maxPriorityFeePerGas});
  await tx0.wait();
  console.log("swapping...");
  const gasEstimate = await router.estimateGas.exactInputSingle(params);
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
  const tx = await router.exactInputSingle(params, {
    gasLimit: gasEstimate.add(BigNumber.from("50000")),
    maxFeePerGas: maxFeePerGas,
    maxPriorityFeePerGas: maxPriorityFeePerGas,
  });
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