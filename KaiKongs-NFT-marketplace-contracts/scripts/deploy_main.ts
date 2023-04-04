import { ethers, upgrades } from 'hardhat'

async function main() {
  const [owner, user1, user2] = await ethers.getSigners()
  console.log('owner = ', owner.address)
  let baseURI =
    'ipfs://bafybeicc7qf4nu6scvwse7xt3g3uadcmf2t467qus75arezj3m57ei4qvq/'
  const MarketplaceFactory = await ethers.getContractFactory('KaiMarketplace')
  const KaiKongsF = await ethers.getContractFactory('KaiFactory')

  const kaiKongsFactory = await KaiKongsF.deploy()
  await kaiKongsFactory.deployed()
  console.log('Kaifactory is deployed to: ', kaiKongsFactory.address)

  const marketplace = await upgrades.deployProxy(MarketplaceFactory, [
    '10000',
    owner.address,
    kaiKongsFactory.address,
  ])
  await marketplace.deployed()

  console.log('marketplace is deployed to: ', marketplace.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
