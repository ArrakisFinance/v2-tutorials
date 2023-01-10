/* eslint-disable @typescript-eslint/naming-convention */
export interface Addresses {
  DAI: string;
  WETH: string;
  PositionLib: string;
}

export const getAddresses = (network: string): Addresses => {
  switch (network) {
    case "hardhat":
      return {
        DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
        WETH: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
        PositionLib: "0xF7cB77C8dCB22A1bb4435932f3515319721Faf44",
      };
    case "mainnet":
      return {
        DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        PositionLib: "0xF7cB77C8dCB22A1bb4435932f3515319721Faf44",
      };
    case "polygon":
      return {
        DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
        WETH: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
        PositionLib: "0xF7cB77C8dCB22A1bb4435932f3515319721Faf44",
      };
    case "optimism":
      return {
        DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
        WETH: "0x4200000000000000000000000000000000000006",
        PositionLib: "0xF7cB77C8dCB22A1bb4435932f3515319721Faf44",
      };
    case "arbitrum":
      return {
        DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
        WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
        PositionLib: "0xF7cB77C8dCB22A1bb4435932f3515319721Faf44",
      };
    case "goerli":
      return {
        DAI: "0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844",
        WETH: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
        PositionLib: "0xF7cB77C8dCB22A1bb4435932f3515319721Faf44",
      };
    default:
      throw new Error(`No addresses for Network: ${network}`);
  }
};
