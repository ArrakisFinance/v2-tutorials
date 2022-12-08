/* eslint-disable @typescript-eslint/naming-convention */
export interface Addresses {
    ArrakisV2Factory: string;
    UniswapV3Factory: string;
    DAI: string;
    WETH: string;
}
  
export const getAddresses = (network: string): Addresses => {
    switch (network) {
      case "hardhat":
        return {
            ArrakisV2Factory: "",
            UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
            DAI: "",
            WETH: "",
        };
      case "mainnet":
        return {
            ArrakisV2Factory: "",
            UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
            DAI: "",
            WETH: "",
        };
      case "polygon":
        return {
            ArrakisV2Factory: "0x32888bb636Cefe86B812adAfd33C05792d9A0e34",
            UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
            DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
            WETH: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
        };
      case "optimism":
        return {
            ArrakisV2Factory: "",
            UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
            DAI: "",
            WETH: "",
        };
      case "goerli":
        return {
            ArrakisV2Factory: "",
            UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
            DAI: "",
            WETH: "",
        };
      default:
        throw new Error(`No addresses for Network: ${network}`);
    }
};