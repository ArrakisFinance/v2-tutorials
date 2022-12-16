/* eslint-disable @typescript-eslint/naming-convention */
export interface Addresses {
  ArrakisV2Factory: string;
  ArrakisV2Helper: string;
  ArrakisV2Resolver: string;
  ArrakisV2PositionLib: string;
  UniswapV3Factory: string;
  DAI: string;
  WETH: string;
}

export const getAddresses = (network: string): Addresses => {
  switch (network) {
    case "hardhat":
      return {
        ArrakisV2Factory: "0x32888bb636Cefe86B812adAfd33C05792d9A0e34",
        ArrakisV2Helper: "0xb36eA03F7A68C92cA5eE61C390928a8C1Ef36ea3",
        ArrakisV2Resolver: "0xddd3B69401e780e3311A6D6c4643Aa791e25137C",
        ArrakisV2PositionLib: "0xaC3F146Eb3e4c13C0155424F177955ca06772f88",
        UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
        WETH: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      };
    case "mainnet":
      return {
        ArrakisV2Factory: "",
        ArrakisV2Helper: "",
        ArrakisV2Resolver: "",
        ArrakisV2PositionLib: "",
        UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        DAI: "",
        WETH: "",
      };
    case "polygon":
      return {
        ArrakisV2Factory: "0x32888bb636Cefe86B812adAfd33C05792d9A0e34",
        ArrakisV2Helper: "0xb36eA03F7A68C92cA5eE61C390928a8C1Ef36ea3",
        ArrakisV2Resolver: "0xddd3B69401e780e3311A6D6c4643Aa791e25137C",
        ArrakisV2PositionLib: "0xaC3F146Eb3e4c13C0155424F177955ca06772f88",
        UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
        WETH: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      };
    case "optimism":
      return {
        ArrakisV2Factory: "",
        ArrakisV2Helper: "",
        ArrakisV2Resolver: "",
        ArrakisV2PositionLib: "",
        UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        DAI: "",
        WETH: "",
      };
    case "goerli":
      return {
        ArrakisV2Factory: "",
        ArrakisV2Helper: "",
        ArrakisV2Resolver: "",
        ArrakisV2PositionLib: "",
        UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        DAI: "",
        WETH: "",
      };
    default:
      throw new Error(`No addresses for Network: ${network}`);
  }
};
