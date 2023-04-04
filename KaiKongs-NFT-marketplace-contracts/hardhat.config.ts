import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@openzeppelin/hardhat-upgrades'
import * as dotenv from 'dotenv'

dotenv.config()

const chainIds = { hardhat: 24 }

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.18',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      forking: {
        url: process.env.MAINNET_RPC || '',
        blockNumber: 13374824,
      },
      chainId: chainIds.hardhat,
    },
    kardia: {
      url: process.env.KARDIA_RPC || '',
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
  mocha: {
    timeout: 2000000,
  },
  gasReporter: {
    currency: 'EUR',
    gasPrice: 21,
  },
}

export default config
