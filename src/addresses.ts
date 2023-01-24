/* eslint-disable @typescript-eslint/naming-convention */
export interface Addresses {
  DAI: string;
  WETH: string;
  UniswapV3Factory: string;
  ArrakisV2Factory: string;
  ArrakisV2Helper: string;
  ArrakisV2Resolver: string;
}

export const getAddresses = (network: string): Addresses => {
  switch (network) {
    case "hardhat":
      return {
        DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
        WETH: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
        UniswapV3Factory: "",
        ArrakisV2Factory: "",
        ArrakisV2Helper: "",
        ArrakisV2Resolver: "",
      };
    case "mainnet":
      return {
        DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        UniswapV3Factory: "",
        ArrakisV2Factory: "",
        ArrakisV2Helper: "",
        ArrakisV2Resolver: "",
      };
    case "polygon":
      return {
        DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
        WETH: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
        UniswapV3Factory: "",
        ArrakisV2Factory: "",
        ArrakisV2Helper: "",
        ArrakisV2Resolver: "",
      };
    case "optimism":
      return {
        DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
        WETH: "0x4200000000000000000000000000000000000006",
        UniswapV3Factory: "",
        ArrakisV2Factory: "",
        ArrakisV2Helper: "",
        ArrakisV2Resolver: "",
      };
    case "arbitrum":
      return {
        DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
        WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
        UniswapV3Factory: "",
        ArrakisV2Factory: "",
        ArrakisV2Helper: "",
        ArrakisV2Resolver: "",
      };
    case "goerli":
      return {
        DAI: "0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844",
        WETH: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
        UniswapV3Factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        ArrakisV2Factory: "0x4DCfe00FB0F5F361aDdD08c7F5AD973EBd19d3ab",
        ArrakisV2Helper: "0xD7C19d32F826e730b526E59eE6f85CeB9C169a9C",
        ArrakisV2Resolver: "0x920C61F097f91b55A74371F24EFcd4AC4cCeAA63",
      };
    default:
      throw new Error(`No addresses for Network: ${network}`);
  }
};
