import hre, { ethers } from "hardhat";
import { IArrakisV2, IArrakisV2Helper } from "../typechain";
import { getAddresses } from "../src/addresses";
import { readFileSync } from "fs";

const addresses = getAddresses(hre.network.name);

async function main() {
  const vaultAddr = readFileSync(`.tutorial1.${hre.network.name}`, {
    encoding: "utf8",
    flag: "r",
  });
  const vault = (await ethers.getContractAt(
    "IArrakisV2",
    vaultAddr
  )) as IArrakisV2;
  const ranges = await vault.getRanges();
  const t0 = await ethers.getContractAt(
    [
      "function decimals() external view returns (uint8)",
      "function symbol() external view returns (string)",
    ],
    await vault.token0()
  );
  const t1 = await ethers.getContractAt(
    [
      "function decimals() external view returns (uint8)",
      "function symbol() external view returns (string)",
    ],
    await vault.token1()
  );
  const t0Decimals = await t0.decimals();
  const t1Decimals = await t1.decimals();
  const t0Symbol = await t0.symbol();
  const t1Symbol = await t1.symbol();
  const arrakisV2Helper = (await ethers.getContractAt(
    "IArrakisV2Helper",
    addresses.ArrakisV2Helper
  )) as IArrakisV2Helper;
  const result = await arrakisV2Helper.totalUnderlyingWithFeesAndLeftOver(
    vaultAddr
  );
  const liquidity0 = result.amount0.sub(result.leftOver0).sub(result.fee0);
  const liquidity1 = result.amount1.sub(result.leftOver1).sub(result.fee1);
  console.log("overview:\n");
  console.log({
    total0: `${ethers.utils.formatUnits(
      result.amount0,
      t0Decimals.toString()
    )} ${t0Symbol}`,
    total1: `${ethers.utils.formatUnits(
      result.amount1,
      t1Decimals.toString()
    )} ${t1Symbol}`,
  });
  const output = {
    liquidity0: `${ethers.utils.formatUnits(
      liquidity0,
      t0Decimals.toString()
    )} ${t0Symbol}`,
    liquidity1: `${ethers.utils.formatUnits(
      liquidity1,
      t1Decimals.toString()
    )} ${t1Symbol}`,
    fee0: `${ethers.utils.formatUnits(
      result.fee0,
      t0Decimals.toString()
    )} ${t0Symbol}`,
    fee1: `${ethers.utils.formatUnits(
      result.fee1,
      t1Decimals.toString()
    )} ${t1Symbol}`,
    leftover0: `${ethers.utils.formatUnits(
      result.leftOver0,
      t0Decimals.toString()
    )} ${t0Symbol}`,
    leftover1: `${ethers.utils.formatUnits(
      result.leftOver1,
      t1Decimals.toString()
    )} ${t1Symbol}`,
  };
  console.log("\nbreakdown:\n");
  console.log(output);
  const result2 = await arrakisV2Helper.token0AndToken1ByRange(
    ranges,
    t0.address,
    t1.address,
    vaultAddr
  );
  if (result2.amount0s.length > 0) {
    console.log("\nliquidity positions:\n");
    for (let i = 0; i < result2.amount0s.length; i++) {
      console.log({
        range: {
          lowerTick: result2.amount0s[i].range.lowerTick,
          upperTick: result2.amount0s[i].range.upperTick,
          feeTier: result2.amount0s[i].range.feeTier,
        },
        amount0: `${ethers.utils.formatUnits(
          result2.amount0s[i].amount,
          t0Decimals.toString()
        )} ${t0Symbol}`,
        amount1: `${ethers.utils.formatUnits(
          result2.amount1s[i].amount,
          t1Decimals.toString()
        )} ${t1Symbol}`,
      });
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
