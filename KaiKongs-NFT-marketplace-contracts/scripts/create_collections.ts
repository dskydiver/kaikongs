import { ethers } from 'hardhat'

async function main() {
  const [owner] = await ethers.getSigners()

  let baseURI_KaiKongs =
    'ipfs://bafybeicc7qf4nu6scvwse7xt3g3uadcmf2t467qus75arezj3m57ei4qvq/'
  let baseURI_KaiCats = 'ipfs://QmRxpxYadHiLb57tpot51wKgYNpKEoEzru2r17rMA2BPmj/'
  let factoryAddress = '0xe5506ac8682a58Ed7Af3cA77F255aaA792C4406f'
  let marketAddress = '0x4990D84AEcdB87c64A8a4Ef6D87dB74C63B99713'
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
