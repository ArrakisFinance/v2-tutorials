import { BigNumber, ethers, BigNumberish } from "ethers";
import { TickMath } from "@uniswap/v3-sdk";
import JSBI from "jsbi";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Q96 = BigNumber.from(2).pow(96);
// eslint-disable-next-line @typescript-eslint/naming-convention
export const Q192 = BigNumber.from(2).pow(192);

export const getSqrtRatioAtTick = (tick: BigNumberish): BigNumber => {
  const tickN = BigNumber.from(tick).toNumber();
  const sqrtPriceX96 = TickMath.getSqrtRatioAtTick(tickN);
  return BigNumber.from(sqrtPriceX96.toString());
};

export const getTickAtSqrtRatio = (sqrtRatio: BigNumberish): number => {
  const tick = TickMath.getTickAtSqrtRatio(
    JSBI.BigInt(BigNumber.from(sqrtRatio).toString())
  );
  return tick;
};

export const mulDivRoundingUp = (
  a: BigNumber,
  b: BigNumber,
  denom: BigNumber
): BigNumber => {
  const product = a.mul(b);
  const result = product.div(denom);
  if (product.mod(denom).gt(ethers.constants.Zero)) {
    if (
      result.lt(
        BigNumber.from(
          "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
        )
      )
    ) {
      return result.add(1);
    } else {
      throw new Error("Failed assertion on mulDivRoundingUp");
    }
  } else {
    return result;
  }
};

/**
 * Calculates liquidity
 * @param total allocation
 * @param sqrtPX96 price
 * @param sqrtPaX96 price on lowerTick
 * @param sqrtPbX96 price on upperTick
 * @returns liquidity amount
 */
export const getLiquidity = (
  total: BigNumber,
  sqrtPX96: BigNumber,
  sqrtPaX96: BigNumber,
  sqrtPbX96: BigNumber
): BigNumber => {
  if (sqrtPX96.lt(sqrtPaX96)) {
    return total
      .mul(Q96)
      .mul(sqrtPbX96)
      .mul(sqrtPaX96)
      .div(sqrtPX96.pow(2))
      .div(sqrtPbX96.sub(sqrtPaX96));
  } else if (sqrtPX96.gt(sqrtPbX96)) {
    return total.mul(Q96).div(sqrtPbX96.sub(sqrtPaX96));
  } else {
    return total
      .mul(Q96)
      .div(sqrtPX96.mul(2).sub(sqrtPX96.pow(2).div(sqrtPbX96)).sub(sqrtPaX96));
  }
};

/**
 * Gets amount of token0 for a liquidity amount in a range
 * @param liquidity amount of liquidity
 * @param sqrtPX96 sqrtPriceX96
 * @param sqrtPaX96 sqrtPriceX96 on lowerTick
 * @param sqrtPbX96 sqrtPriceX96 on upperTick
 * @returns amount of token0 in range
 */
export const getAmount0 = (
  liquidity: BigNumber,
  sqrtPX96: BigNumber,
  sqrtPaX96: BigNumber,
  sqrtPbX96: BigNumber
): BigNumber => {
  if (sqrtPX96.lt(sqrtPaX96)) {
    return mulDivRoundingUp(liquidity, Q96, sqrtPaX96).sub(
      liquidity.mul(Q96).div(sqrtPbX96)
    );
  } else if (sqrtPX96.gt(sqrtPbX96)) {
    return BigNumber.from(0);
  } else {
    return mulDivRoundingUp(liquidity, Q96, sqrtPX96).sub(
      liquidity.mul(Q96).div(sqrtPbX96)
    );
  }
};

/**
 * Gets amount of token1 for a liquidity amount in a range
 * @param liquidity amount of liquidity
 * @param sqrtPX96 sqrtPriceX96
 * @param sqrtPaX96 sqrtPriceX96 on lowerTick
 * @param sqrtPbX96 sqrtPriceX96 on upperTick
 * @returns amount of token1 in range
 */
export const getAmount1 = (
  liquidity: BigNumber,
  sqrtPX96: BigNumber,
  sqrtPaX96: BigNumber,
  sqrtPbX96: BigNumber
): BigNumber => {
  if (sqrtPX96.lt(sqrtPaX96)) {
    return BigNumber.from(0);
  } else if (sqrtPX96.gt(sqrtPbX96)) {
    return mulDivRoundingUp(liquidity, sqrtPbX96.sub(sqrtPaX96), Q96);
  } else {
    return mulDivRoundingUp(liquidity, sqrtPX96.sub(sqrtPaX96), Q96);
  }
};

/**
 * Calculates total in terms of token1 given amounts of base and asset token
 * @param available0 amount of token0
 * @param available1 amount of token1
 * @param sqrtPriceX96 current price (coming from slot0)
 * @returns BigNumber with the total amounts in terms of token1
 */
export const getTotalInToken1 = (
  available0: BigNumber,
  available1: BigNumber,
  sqrtPriceX96: BigNumber
): BigNumber => {
  return available1.add(
    available0.mul(Q192).div(sqrtPriceX96).div(sqrtPriceX96)
  );
};

/**
 * Gets amount of token0 given a max available amount
 * @param available0 amount available
 * @param use0 amount available to be used (for preventing rounding errors)
 * @param sqrtPX96 sqrtPriceX96
 * @param sqrtPaX96 sqrtPriceX96 on lowerTick
 * @param sqrtPbX96 sqrtPriceX96 on upperTick
 * @returns amount of token1 in range
 */
export const getAmountsForMaxAmount0Internal = (
  available0: BigNumber,
  use0: BigNumber,
  sqrtPX96: BigNumber,
  sqrtPaX96: BigNumber,
  sqrtPbX96: BigNumber
): [BigNumber, BigNumber, BigNumber] => {
  const liquidity = use0
    .mul(sqrtPbX96)
    .mul(sqrtPX96)
    .div(sqrtPbX96.sub(sqrtPX96))
    .div(Q96);

  const amount0 = getAmount0(liquidity, sqrtPX96, sqrtPaX96, sqrtPbX96);
  if (amount0.gt(available0))
    return getAmountsForMaxAmount0Internal(
      available0,
      use0.sub(1),
      sqrtPX96,
      sqrtPaX96,
      sqrtPbX96
    );

  const amount1 = getAmount1(liquidity, sqrtPX96, sqrtPaX96, sqrtPbX96);
  return [liquidity, amount0, amount1];
};

/**
 * Gets amount of token0 given a max available amount
 * @param available0 amount available
 * @param sqrtPX96 sqrtPriceX96
 * @param sqrtPaX96 sqrtPriceX96 on lowerTick
 * @param sqrtPbX96 sqrtPriceX96 on upperTick
 * @returns amount of token1 in range
 */
export const getAmountsForMaxAmount0 = (
  available0: BigNumber,
  sqrtPX96: BigNumber,
  sqrtPaX96: BigNumber,
  sqrtPbX96: BigNumber
): [BigNumber, BigNumber, BigNumber] => {
  return getAmountsForMaxAmount0Internal(
    available0,
    available0,
    sqrtPX96,
    sqrtPaX96,
    sqrtPbX96
  );
};

/**
 * Gets amount of token1 given a max available amount
 * @param available1 amount available
 * @param use1 amount available to be used (for preventing rounding errors)
 * @param sqrtPX96 sqrtPriceX96
 * @param sqrtPaX96 sqrtPriceX96 on lowerTick
 * @param sqrtPbX96 sqrtPriceX96 on upperTick
 * @returns amount of token1 in range
 */
export const getAmountsForMaxAmount1Internal = (
  available1: BigNumber,
  use1: BigNumber,
  sqrtPX96: BigNumber,
  sqrtPaX96: BigNumber,
  sqrtPbX96: BigNumber
): [BigNumber, BigNumber, BigNumber] => {
  const liquidity = use1.mul(Q96).div(sqrtPX96.sub(sqrtPaX96));

  const amount1 = getAmount1(liquidity, sqrtPX96, sqrtPaX96, sqrtPbX96);
  if (amount1.gt(available1))
    return getAmountsForMaxAmount1Internal(
      available1,
      use1.sub(1),
      sqrtPX96,
      sqrtPaX96,
      sqrtPbX96
    );

  const amount0 = getAmount0(liquidity, sqrtPX96, sqrtPaX96, sqrtPbX96);
  return [liquidity, amount0, amount1];
};

/**
 * Gets amount of token1 given a max available amount
 * @param available1 amount available
 * @param sqrtPX96 sqrtPriceX96
 * @param sqrtPaX96 sqrtPriceX96 on lowerTick
 * @param sqrtPbX96 sqrtPriceX96 on upperTick
 * @returns amount of token1 in range
 */
export const getAmountsForMaxAmount1 = (
  available1: BigNumber,
  sqrtPX96: BigNumber,
  sqrtPaX96: BigNumber,
  sqrtPbX96: BigNumber
): [BigNumber, BigNumber, BigNumber] => {
  return getAmountsForMaxAmount1Internal(
    available1,
    available1,
    sqrtPX96,
    sqrtPaX96,
    sqrtPbX96
  );
};
