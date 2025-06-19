import { ethers } from "hardhat";

const abi = [
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "tokenIn", type: "address" },
          { internalType: "address", name: "tokenOut", type: "address" },
          { internalType: "uint256", name: "amountIn", type: "uint256" },
          { internalType: "int24", name: "tickSpacing", type: "int24" },
          {
            internalType: "uint160",
            name: "sqrtPriceLimitX96",
            type: "uint160",
          },
        ],
        internalType: "struct IQuoterV2.QuoteExactInputSingleParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "quoteExactInputSingle",
    outputs: [
      { internalType: "uint256", name: "amountOut", type: "uint256" },
      { internalType: "uint160", name: "sqrtPriceX96After", type: "uint160" },
      {
        internalType: "uint32",
        name: "initializedTicksCrossed",
        type: "uint32",
      },
      { internalType: "uint256", name: "gasEstimate", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes", name: "path", type: "bytes" },
      { internalType: "uint256", name: "amountOut", type: "uint256" },
    ],
    name: "quoteExactOutput",
    outputs: [
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      {
        internalType: "uint160[]",
        name: "sqrtPriceX96AfterList",
        type: "uint160[]",
      },
      {
        internalType: "uint32[]",
        name: "initializedTicksCrossedList",
        type: "uint32[]",
      },
      { internalType: "uint256", name: "gasEstimate", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "tokenIn", type: "address" },
          { internalType: "address", name: "tokenOut", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "int24", name: "tickSpacing", type: "int24" },
          {
            internalType: "uint160",
            name: "sqrtPriceLimitX96",
            type: "uint160",
          },
        ],
        internalType: "struct IQuoterV2.QuoteExactOutputSingleParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "quoteExactOutputSingle",
    outputs: [
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "uint160", name: "sqrtPriceX96After", type: "uint160" },
      {
        internalType: "uint32",
        name: "initializedTicksCrossed",
        type: "uint32",
      },
      { internalType: "uint256", name: "gasEstimate", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "int256", name: "amount0Delta", type: "int256" },
      { internalType: "int256", name: "amount1Delta", type: "int256" },
      { internalType: "bytes", name: "path", type: "bytes" },
    ],
    name: "uniswapV3SwapCallback",
    outputs: [],
    stateMutability: "view",
    type: "function",
  },
];

import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "../.env" });

async function main() {
  const token0 = "0x4200000000000000000000000000000000000006";
  const token1 = "0x4eeD0d2deb4C588393c80869B122327581B0D98e";
  const sqrtPriceLimitX96 = "17499072790755600000000000";
  const tickSpacing = 200;

  const tokenIn = token1;
  const tokenOut = token0;

  // AERODROME
  const quoter = await ethers.getContractAt(
    abi,
    "0x254cF9E1E6e233aa1AC962CB9B05b2cfeAaE15b0"
  );
  const params = {
    tokenIn,
    tokenOut,
    amount: ethers.utils.parseEther("5000000000"),
    tickSpacing,
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
