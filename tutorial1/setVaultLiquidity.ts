import hre, { ethers } from "hardhat";
import {
  IArrakisV2,
  IArrakisV2Helper,
  IUniswapV3Factory,
  IUniswapV3Pool,
} from "../typechain";
import { getAddresses } from "../src/addresses";
import {
  getAmountsForMaxAmount0,
  getAmountsForMaxAmount1,
  getSqrtRatioAtTick,
  sleep,
} from "../src/utils";
import { BigNumber } from "ethers";
import { readFileSync } from "fs";

import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "../.env" });
const maxFeeGlobal = process.env.MAX_FEE_OVERRIDE;
const maxPriorityFeeGlobal = process.env.MAX_PRIORITY_FEE_OVERRIDE;

const addresses = getAddresses(hre.network.name);

const feeTiers = [500, 3000];
const tickDeltaByFeeTier = [1800, 6900];
const tickSpacingByFeeTier = [10, 60];

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
    hre.network.name === "arbitrum" ||
    hre.network.name === "goerli"
  ) {
    console.log(
      `set positions for vault: ${vaultAddr} on network: ${
        hre.network.name
      }\nGas Info:\nMaxFeePerGas: ${Number(
        ethers.utils.formatUnits(maxFeePerGas, "gwei")
      ).toFixed(1)} gwei\nMaxPriorityFeePerGas: ${Number(
        ethers.utils.formatUnits(maxPriorityFeePerGas, "gwei")
      ).toFixed(1)} gwei\n\n\n    sleeping for 10 seconds\n\n`
    );
    await sleep(10000);
  }

  const factory = (await ethers.getContractAt(
    "IUniswapV3Factory",
    addresses.UniswapV3Factory
  )) as IUniswapV3Factory;

  const vault = (await ethers.getContractAt(
    "IArrakisV2",
    vaultAddr,
    user
  )) as IArrakisV2;

  const token0 = await vault.token0();
  const token1 = await vault.token1();

  const poolA = (await ethers.getContractAt(
    "IUniswapV3Pool",
    await factory.getPool(token0, token1, feeTiers[0])
  )) as IUniswapV3Pool;
  const poolB = (await ethers.getContractAt(
    "IUniswapV3Pool",
    await factory.getPool(token0, token1, feeTiers[1])
  )) as IUniswapV3Pool;

  const slot0A = await poolA.slot0();
  const tickA = slot0A.tick;
  let tickLowerA = Number(tickA.toString()) - tickDeltaByFeeTier[0];
  //
  const modLowerA = tickLowerA % tickSpacingByFeeTier[0];
  if (modLowerA != 0) {
    tickLowerA = tickLowerA - modLowerA;
    if (modLowerA > tickSpacingByFeeTier[0] / 2) {
      tickLowerA = tickLowerA + tickSpacingByFeeTier[0];
    }
  }
  let tickUpperA = Number(tickA.toString()) + tickDeltaByFeeTier[0];
  const modUpperA = tickUpperA % tickSpacingByFeeTier[0];
  if (modUpperA != 0) {
    tickUpperA = tickUpperA + tickSpacingByFeeTier[0] - modUpperA;
    if (modUpperA < tickSpacingByFeeTier[0] / 2) {
      tickUpperA = tickUpperA - tickSpacingByFeeTier[0];
    }
  }
  const sqrtPriceAboveA = getSqrtRatioAtTick(tickUpperA);
  const sqrtPriceBelowA = getSqrtRatioAtTick(tickLowerA);
  const sqrtPriceA = slot0A.sqrtPriceX96;

  const slot0B = await poolB.slot0();
  const tickB = slot0B.tick;
  let tickLowerB = Number(tickB.toString()) - tickDeltaByFeeTier[1];
  const modLowerB = tickLowerB % tickSpacingByFeeTier[1];
  if (modLowerB != 0) {
    tickLowerB = tickLowerB - modLowerB;
    if (modLowerB > tickSpacingByFeeTier[1] / 2) {
      tickLowerB = tickLowerB + tickSpacingByFeeTier[1];
    }
  }
  let tickUpperB = Number(tickB.toString()) + tickDeltaByFeeTier[1];
  const modUpperB = tickUpperB % tickSpacingByFeeTier[1];
  if (modUpperB != 0) {
    tickUpperB = tickUpperB + tickSpacingByFeeTier[1] - modUpperB;
    if (modUpperB < tickSpacingByFeeTier[1] / 2) {
      tickUpperB = tickUpperB - tickSpacingByFeeTier[1];
    }
  }
  const sqrtPriceAboveB = getSqrtRatioAtTick(tickUpperB);
  const sqrtPriceBelowB = getSqrtRatioAtTick(tickLowerB);
  const sqrtPriceB = slot0B.sqrtPriceX96;

  const helper = (await ethers.getContractAt(
    "IArrakisV2Helper",
    addresses.ArrakisV2Helper
  )) as IArrakisV2Helper;

  const ranges = await vault.getRanges();

  if (ranges.length > 0) {
    console.log("ERROR: ranges already created");
    return;
  }

  const result = await helper.totalUnderlyingWithFeesAndLeftOver(vaultAddr);

  if (
    !result.amount0.eq(result.leftOver0) ||
    !result.amount1.eq(result.leftOver1)
  ) {
    console.log("ERROR: tokens already deposited");
    return;
  }

  const gross0 = result.amount0.sub(result.amount0.div(BigNumber.from("500")));
  const gross1 = result.amount1.sub(result.amount1.div(BigNumber.from("500")));

  const half0 = gross0.div(BigNumber.from("2"));
  const half1 = gross1.div(BigNumber.from("2"));

  const liquidityB0 = getAmountsForMaxAmount0(
    half0,
    sqrtPriceB,
    sqrtPriceBelowB,
    sqrtPriceAboveB
  );

  const liquidityB1 = getAmountsForMaxAmount1(
    half1,
    sqrtPriceB,
    sqrtPriceBelowB,
    sqrtPriceAboveB
  );

  const liquidityB = liquidityB0[0].gte(liquidityB1[0])
    ? liquidityB0
    : liquidityB1;

  const remaining0 = gross0.sub(liquidityB[1]);
  const remaining1 = gross1.sub(liquidityB[2]);

  const liquidityA0 = getAmountsForMaxAmount0(
    remaining0,
    sqrtPriceA,
    sqrtPriceBelowA,
    sqrtPriceAboveA
  );

  const liquidityA1 = getAmountsForMaxAmount1(
    remaining1,
    sqrtPriceA,
    sqrtPriceBelowA,
    sqrtPriceAboveA
  );

  const liquidityA = liquidityA0[0].lt(liquidityA1[0])
    ? liquidityA0
    : liquidityA1;

  const total0 = liquidityB[1].add(liquidityA[1]);
  const total1 = liquidityB[2].add(liquidityA[2]);

  const min0 = total0.sub(total0.div(BigNumber.from("100")));
  const min1 = total1.sub(total1.div(BigNumber.from("100")));

  const rangeA = {
    lowerTick: tickLowerA,
    upperTick: tickUpperA,
    feeTier: feeTiers[0],
  };

  const rangeB = {
    lowerTick: tickLowerB,
    upperTick: tickUpperB,
    feeTier: feeTiers[1],
  };

  console.log("rebalance tx...");
  const gasEstimate = await vault.estimateGas.rebalance({
    burns: [],
    mints: [
      {
        liquidity: liquidityA[0],
        range: rangeA,
      },
      {
        liquidity: liquidityB[0],
        range: rangeB,
      },
    ],
    swap: {
      payload: "0x",
      router: ethers.constants.AddressZero,
      amountIn: ethers.constants.Zero,
      expectedMinReturn: ethers.constants.Zero,
      zeroForOne: true,
    },
    minBurn0: 0,
    minBurn1: 0,
    minDeposit0: min0,
    minDeposit1: min1,
  });
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
  const tx = await vault.rebalance(
    {
      burns: [],
      mints: [
        {
          liquidity: liquidityA[0],
          range: rangeA,
        },
        {
          liquidity: liquidityB[0],
          range: rangeB,
        },
      ],
      swap: {
        payload: "0x",
        router: ethers.constants.AddressZero,
        amountIn: ethers.constants.Zero,
        expectedMinReturn: ethers.constants.Zero,
        zeroForOne: true,
      },
      minBurn0: 0,
      minBurn1: 0,
      minDeposit0: min0,
      minDeposit1: min1,
    },
    {
      gasLimit: gasEstimate.add(BigNumber.from("50000")),
      maxFeePerGas: maxFeePerGas,
      maxPriorityFeePerGas: maxPriorityFeePerGas,
    }
  );
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
