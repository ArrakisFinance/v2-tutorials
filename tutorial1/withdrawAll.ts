import hre, { ethers } from "hardhat";
import { IERC20, IArrakisV2 } from "../typechain";
import { sleep } from "../src/utils";
import { BigNumber } from "ethers";
import { readFileSync } from "fs";

import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "../.env" });
const maxFeeGlobal = process.env.MAX_FEE_OVERRIDE;
const maxPriorityFeeGlobal = process.env.MAX_PRIORITY_FEE_OVERRIDE;

async function main() {
  const vaultAddr = readFileSync(`.tutorial1.${hre.network.name}`, {
    encoding: "utf8",
    flag: "r",
  });
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
  let maxPriorityFeePerGas: BigNumber = feeData.maxFeePerGas;
  if (
    hre.network.name === "mainnet" ||
    hre.network.name === "polygon" ||
    hre.network.name === "optimism" ||
    hre.network.name === "goerli"
  ) {
    console.log(
      `withdraw all from vault: ${vaultAddr} on network: ${
        hre.network.name
      }\nGas Info:\nMaxFeePerGas: ${Number(
        ethers.utils.formatUnits(maxFeePerGas, "gwei")
      ).toFixed(1)} gwei\nMaxPriorityFeePerGas: ${Number(
        ethers.utils.formatUnits(maxPriorityFeePerGas, "gwei")
      ).toFixed(1)} gwei\n\n\n    sleeping for 10 seconds\n\n`
    );
    await sleep(10000);
  }

  const vault = (await ethers.getContractAt(
    "IArrakisV2",
    vaultAddr,
    user
  )) as IArrakisV2;

  const vaultToken = (await ethers.getContractAt(
    "IERC20",
    vaultAddr
  )) as IERC20;

  const userAddr = await user.getAddress();
  const userBalance = await vaultToken.balanceOf(userAddr);

  console.log("withdrawing...");
  const gasEstimate = await vault.estimateGas.burn(userBalance, userAddr);
  if (Number(maxFeeGlobal) == 0) {
    feeData = await user?.provider?.getFeeData();
  }
  if (
    feeData != undefined &&
    feeData.maxFeePerGas != undefined &&
    feeData.maxPriorityFeePerGas != undefined
  ) {
    maxFeePerGas = feeData.maxFeePerGas;
    maxPriorityFeePerGas = feeData.maxFeePerGas;
  }
  const tx = await vault.burn(userBalance, userAddr, {
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
