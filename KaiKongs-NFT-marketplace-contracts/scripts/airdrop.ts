import { ethers } from 'hardhat'
import { Console } from 'console'
import fs from 'fs'

const myLogger = new Console({
  stdout: fs.createWriteStream('airdropOutput.txt'),
  stderr: fs.createWriteStream('airdropErrorOutput.txt'),
})

async function main() {
  const [owner] = await ethers.getSigners()

  const baseURI_KaiKongs =
    'ipfs://bafybeicc7qf4nu6scvwse7xt3g3uadcmf2t467qus75arezj3m57ei4qvq/'
  const baseURI_KaiCats =
    'ipfs://QmRxpxYadHiLb57tpot51wKgYNpKEoEzru2r17rMA2BPmj/'
  const factoryAddress = '0xe5506ac8682a58Ed7Af3cA77F255aaA792C4406f'
  const marketAddress = '0x4990D84AEcdB87c64A8a4Ef6D87dB74C63B99713'
  const oldKaiKongsAddress = '0xe83a69C8CD50d681895602ACdEC81F7847E70fde'
  const oldMarketAddress = '0xC595e0D9dd590c82F415c00A770755a5D3B626BC'
  const KKAddress = '0x4EaBa3290f06233aa9D780B77A6DA486aB425c1f'
  const KCAddress = '0xE783625703A1FC7AF847C0dc50acce2F8863Db24'
  // const factory = await ethers.getContractAt('KaiFactory', factoryAddress)
  // const market = await ethers.getContractAt('KaiMarketplace', marketAddress)
  const oldMarket = await ethers.getContractAt(
    'KardiaKingdom',
    oldMarketAddress
  )
  const oldKaiKongs = await ethers.getContractAt('KaiKongs', oldKaiKongsAddress)
  const KK = await ethers.getContractAt('KaiNFT', KKAddress)
  const KC = await ethers.getContractAt('KaiNFT', KCAddress)

  for (let i = 1; i <= 10000; i++) {
    let ownerAddress = await oldKaiKongs.ownerOf(i)
    myLogger.log(' - ', i, ownerAddress)
    console.log(' - ', i, ownerAddress)
    if (ownerAddress === oldMarketAddress) {
      ownerAddress = await oldMarket.getSeller(i)
      myLogger.log(
        '     This NFT is listed on old market by %s. id : %d',
        ownerAddress,
        i
      )
      console.log(
        '     This NFT is listed on old market by %s. id : %d',
        ownerAddress,
        i
      )
    }
    await (await KK.mint(ownerAddress, 1)).wait()
    const KKId = await KK.totalSupply()
    myLogger.log('    - KK mint %s to %s', KKId.toString(), ownerAddress)
    console.log('    - KK mint %s to %s', KKId.toString(), ownerAddress)
    await (await KC.mint(ownerAddress, 1)).wait()
    const KCId = await KC.totalSupply()
    myLogger.log('    - KC mint %s to %s', KCId.toString(), ownerAddress)
    console.log('    - KC mint %s to %s', KCId.toString(), ownerAddress)
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
