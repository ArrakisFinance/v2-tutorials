import { HardhatUserConfig } from "hardhat/config";

// PLUGINS
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@typechain/hardhat";
import "hardhat-deploy";
import "solidity-coverage";

import { ethers } from "ethers";

// Process Env Variables
import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env" });
const ALCHEMY_ID = process.env.ALCHEMY_ID;
const PK = process.env.PK;

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",

  // hardhat-deploy
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },

  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },

  networks: {
    hardhat: {
      forking: {
        url: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_ID}`,
        blockNumber: 38809120,
      },
      accounts: {
        accountsBalance: ethers.utils.parseEther("10000").toString(),
      },
    },
    mainnet: {
      accounts: PK ? [PK] : [],
      chainId: 1,
      url: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_ID}`,
    },
    polygon: {
      accounts: PK ? [PK] : [],
      chainId: 137,
      url: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_ID}`,
    },
    optimism: {
      accounts: PK ? [PK] : [],
      chainId: 10,
      url: `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_ID}`,
    },
    arbitrum: {
      accounts: PK ? [PK] : [],
      chainId: 42161,
      url: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_ID}`,
    },
    goerli: {
      accounts: PK ? [PK] : [],
      chainId: 5,
      url: `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_ID}`,
    },
    sepolia: {
      accounts: PK ? [PK] : [],
      chainId: 11155111,
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_ID}`,
    },
  },

  solidity: {
    compilers: [
      {
        version: "0.8.13",
        settings: {
          optimizer: { enabled: true, runs: 999999 },
        },
      },
    ],
  },

  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
};

export default config;
