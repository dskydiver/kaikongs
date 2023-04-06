import { ethers } from 'hardhat'

async function main() {
  const [owner] = await ethers.getSigners()

  let nftaddress = '0x0fdAFa61F9AfF5a36cEc6526C1F2e546739a2583'
  let marketAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
  let ownerAddress = '0xa24Ff9B75d8A4b1BE4e24ff99b11594ADb1A552a'
  let nft = await ethers.getContractAt('KaiNFT', nftaddress)
  let market = await ethers.getContractAt('KaiMarketplace', marketAddress)

  await (await nft.mint(ownerAddress, 1)).wait()

  // await (await nft.setApprovalForAll(marketAddress, true)).wait()
  // for (let i = 3; i < 14; i++) {
  //   await (
  //     await market.createSell(
  //       nftaddress,
  //       i,
  //       ethers.utils.parseEther(i.toString()),
  //       owner.address
  //     )
  //   ).wait()
  // }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
