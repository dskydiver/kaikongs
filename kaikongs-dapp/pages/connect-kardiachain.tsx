import React from 'react'
declare var window: any
import { useEffect, useState } from 'react';


const connectKarida = () => {

    const networks = {
        kardiachain: {
            chainId: `0x${Number(24).toString(16)}`,
            chainName: "KardiaChain Mainnet",
            nativeCurrency: {
                name: "KAI",
                symbol: "KAI",
                decimals: 18
            },
            rpcUrls: ["https://rpc-2.kardiachain.io"],
            blockExplorerUrls: ["https://explorer.kardiachain.io/"],
        }
    }

    const connectNetwork = async () => {
        if (window.ethereum){
          const currentNetwork = await web3.eth.net.getId()
          await currentNetwork;
          
          if (currentNetwork != "242"){
            try{
                await window.ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [{chainId: `0x${Number(24).toString(16)}`}]
                })
                console.log('succeed')
                window.location.replace('/market');
            } catch(err){
                console.log(err)
                if (err.code == 4902){
                    await window.ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [{...networks["kardiachain"]}]
                    })
                }
               window.location.replace('/market');
            }
          } else {
            // setCorrectNetwork(true);
            console.log("Already on Kardia Chain")
          }
        } else {
            alert("Install Metmask.")
        }
      }

      const Web3 = require('web3')
      const rpcURL = "https://rpc-2.kardiachain.io"    
      const web3 = new Web3(Web3.givenProvder || rpcURL);

  return (
    <div className='w-full min-h-screen flex justify-center items-center'>

        <div className='w-fit'>
            <button onClick={connectNetwork} className='text-sm flex gap-3 p-2 bg-gray-200  items-center rounded-lg'>Connect Galaxias Mainnet <img src="/metamask.png" width='30' alt="metamask icon" /></button >
        </div>

    </div>
  )
}

export default connectKarida