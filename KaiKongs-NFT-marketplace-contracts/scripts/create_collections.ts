import { ethers } from 'hardhat'

async function main() {
  const [owner] = await ethers.getSigners()

  let baseURI_KaiKongs =
    'ipfs://bafybeicc7qf4nu6scvwse7xt3g3uadcmf2t467qus75arezj3m57ei4qvq/'
  let baseURI_KaiCats = 'ipfs://QmNbh5YA4fZsQHLKMmS2va15U9mYtcu91HMNVjnvRnVE5A/'
  let factoryAddress = '0xaD82dB7b49001006879B89A786fCA99aC06AbB14'
  let marketAddress = '0x7f9Fd5072CaC7A47f1e595d1b4fa816c068CDff0'
  let factory = await ethers.getContractAt('KaiFactory', factoryAddress)
  let market = await ethers.getContractAt('KaiMarketplace', marketAddress)

  await (
    await factory.createCollection(
      'Kai Kongs',
      'KK',
      10000,
      owner.address,
      ethers.utils.parseEther('1'),
      10000,
      baseURI_KaiKongs
    )
  ).wait()
  await (
    await factory.createCollection(
      'Kai Cats',
      'KC',
      10000,
      owner.address,
      ethers.utils.parseEther('1'),
      10000,
      baseURI_KaiCats
    )
  ).wait()
  console.log(await factory.getUserCollections(owner.address))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
