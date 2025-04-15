import { ethers } from "hardhat";
import { abi } from "@uniswap/v3-periphery/artifacts/contracts/interfaces/IQuoterV2.sol/IQuoterV2.json";

import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "../.env" });

async function main() {
  const token0 = "0x010700AB046Dd8e92b0e3587842080Df36364ed3";
  const token1 = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
  const sqrtPriceLimitX96 = "6561087585007712000000000000";
  const fee = 10000;

  const tokenIn = token1;
  const tokenOut = token0;

  // const quoter = await ethers.getContractAt(abi, "0x7E9cB3499A6cee3baBe5c8a3D328EA7FD36578f4");
  const quoter = await ethers.getContractAt(
    abi,
    "0x61fFE014bA17989E743c5F6cB21bF9697530B21e"
  );
  // const quoter = await ethers.getContractAt(abi, "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a");
  const params = {
    tokenIn,
    tokenOut,
    amount: ethers.utils.parseEther("5000000000"),
    fee,
    sqrtPriceLimitX96,
  };
  console.log(params);
  const quote = await quoter.callStatic.quoteExactOutputSingle(params);
  console.log(
    `amountIn: ${quote.amountIn} sqrtPriceX96After: ${quote.sqrtPriceX96After}`
  );

  //   const params = {
  //     tokenIn,
  //     tokenOut,
  //     amountIn: ethers.utils.parseEther("66691.9"),
  //     fee,
  //     sqrtPriceLimitX96
  //   };
  //   console.log(params);
  //   const quote = await quoter.callStatic.quoteExactInputSingle(params);
  //   console.log(`sqrtPriceX96After: ${quote.sqrtPriceX96After}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
