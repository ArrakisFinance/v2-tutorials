import hre, { ethers } from "hardhat";
import {
  IUniswapV3Factory,
  IArrakisV2Factory,
  IArrakisV2Extended
} from "../typechain";
import { getAddresses } from "../src/addresses";

const addresses = getAddresses(hre.network.name)

// #region input values.
const feeTiers = [500, 3000];
const daiToken = addresses.DAI;
const wethToken = addresses.WETH;

// #endregion input values.

async function main() {
  const [user] = await ethers.getSigners();
  const userAddr = await user.getAddress();
  const arrakisV2Factory = await ethers.getContractAt("IArrakisV2Factory", addresses.ArrakisV2Factory);

  const uniswapV3Factory = (await ethers.getContractAt(
    "IUniswapV3Factory",
    addresses.UniswapV3Factory,
    user
  )) as IUniswapV3Factory;

  for (let i=0; i<feeTiers.length; i++) {
    const poolAddr = await uniswapV3Factory.getPool(daiToken, daiToken, feeTiers[i]);
    if (poolAddr == ethers.constants.AddressZero) {
        console.log("ERROR: uniswap pool at fee tier DNE");
        return
    }
  }

  // #region ERC20 contracts.

  const daiTokenContract = new ethers.Contract(
    daiToken,
    [
      "function decimals() external view returns (uint8)",
      "function balanceOf(address account) public view returns (uint256)",
      "function approve(address spender, uint256 amount) external returns (bool)",
    ],
    user
  );

  const oneDai = ethers.utils.parseEther("1");
  const daiTokenBal = await daiTokenContract.balanceOf(userAddr);

  if (daiTokenBal.lt(oneDai)) {
    console.log("ERROR: need 1 DAI");
    return
  }

  const isLower = parseInt(daiToken, 16) < parseInt(wethToken, 16);
  const token0 = isLower ? daiToken : wethToken;
  const token1 = isLower ? wethToken : daiToken;
  const init0 = isLower ? oneDai : "0";
  const init1 = isLower ? "0" : oneDai;

  // #endregion ERC20 contracts.

  const tx = await arrakisV2Factory.deployVault(
    {
      feeTiers: feeTiers,
      token0: token0,
      token1: token1,
      owner: userAddr,
      init0: init0,
      init1: init1,
      manager: userAddr,
      routers: [],
      burnBuffer: "1000"
    },
    true
  );

  const rc = await tx.wait();
  const event = rc?.events?.find(
    (e: { event: string }) => e.event === "VaultCreated"
  );
  // eslint-disable-next-line no-unsafe-optional-chaining
  const result = event?.args;
  const vault = result?.vault;

  const vaultContract = (await ethers.getContractAt(
    "IArrakisV2Extended",
    vault,
    user
  )) as IArrakisV2Extended;

  const tx2 = await vaultContract.setRestrictedMint(userAddr)

  await tx2.wait();
  const restrictedMintCheck = await vaultContract.restrictedMint();

  if (restrictedMintCheck != userAddr) {
    console.log("ERROR: restricted mint");
    return
  }
  const supplyCheck = await vaultContract.totalSupply();
  if (Number(supplyCheck.toString()) != 0) {
    console.log("ERROR: supply should be 0");
    return
  }

  const tx3 = await daiTokenContract.approve(vault, oneDai);
  await tx3.wait();

  const tx4 = await vaultContract.mint(oneDai, userAddr);
  tx4.wait();

  console.log("Vault Created! Address: ", vault);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });