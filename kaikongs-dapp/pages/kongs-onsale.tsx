// @ts-nocheck
import React from 'react'
import Image from 'next/image'
import { useState, useEffect } from 'react';
import Pagination from '../components/Pagination';
import paginate from '../utls/paginate';
import profileImg from '../public/card.jpg';
import metadataJSON from '../public/_metadata_with_rarity.json';


declare var window: any


const Holdings = () => {
  const [wallet, setWallet] = useState();
  const [holdings, setHoldings] = useState([]);

  const [onSale, setOnSale] = useState(0);


  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const Web3 = require('web3')
  const rpcURL = "https://rpc-2.kardiachain.io"
  const web3 = new Web3(Web3.givenProvider || rpcURL);


  const nftContractABI = require('../contract-abi.json');
  const nftContractAddress = "0xe83a69C8CD50d681895602ACdEC81F7847E70fde";

   // marketplace 
   const contractABI = require('../marketplace-contract-abi.json');
   const contractAddress = "0xC595e0D9dd590c82F415c00A770755a5D3B626BC";

   let marketplace = new web3.eth.Contract(contractABI, contractAddress);
  

  let contract = new web3.eth.Contract(nftContractABI, nftContractAddress);
  let rawdata;

  let onSaleTokens;


  async function getCurrentWallet(): Promise<void> {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      const account = accounts[0]
      setWallet(account)
    }
  }

  const walletListener = () => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        // console.log(accounts[0]);
        setWallet(accounts[0])
      })
    }
  }

  
  
  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      setWallet(account)
    } else {
      window.open('https://metamask.io/', '_blank');
    }
  }

  const getOnSale = async () => {
    const saleTokens = await marketplace.methods.getListedNFTsByUser(wallet).call()
    await saleTokens;
    setOnSale(saleTokens.length);
  }
  
  useEffect(() => {
    getCurrentWallet();
    walletListener();
  }, []);
  
  useEffect(() => {
    if (wallet != undefined){
      getOnSale();
    }
  })

  useEffect(() => {
    if (wallet != undefined){
      fetchNFTs();
    }
  }, [onSale])



  const fetchNFTs = async () => {
    const onSaleTokens = await marketplace.methods.getListedNFTsByUser(wallet).call()
    for (let i = 0; i < onSale; i++){
        // let tokenMetadataURI = await contract.methods.tokenURI(onSaleTokens[i]).call();

        // tokenMetadataURI = `https://kai-kongs.myfilebase.com/ipfs/${tokenMetadataURI.split("ipfs://")[1]}`
        
        const tokenMetadataURI = `https://kai-kongs.myfilebase.com/ipfs/bafybeicc7qf4nu6scvwse7xt3g3uadcmf2t467qus75arezj3m57ei4qvq/${onSaleTokens[i]}.json`
        
        const tokenMetadata = await fetch(tokenMetadataURI).then((response) => response.json())
        let tokenImage = tokenMetadata.image;
        
        tokenImage = `https://kai-kongs.myfilebase.com/ipfs/${tokenImage.split("ipfs://")[1]}`
        const tokenName = tokenMetadata.name;

        const nft = metadataJSON.find((nft) => { return +nft.edition === +tokenMetadata.name.split("#")[1] });

        // console.log(nft.name);

        setHoldings(holdings => [...holdings, { id: holdings.length, name: tokenName, image: tokenImage, token: onSaleTokens[i], rank: nft.rank }])
    }

    // console.log(holdings);
    
  }
  
  const handlePageChange = page => {
    setCurrentPage(page);
  };
  
  const paginateHoldings = paginate(holdings, currentPage, pageSize)

  return (
    <div className="w-full min-h-screen holdings__wrapper">
      <div className="top__bar cover__pg w-full text-center bg-gray-200 py-2 min-h-[20rem]">
      </div>
      <div className="mx-auto max-w-2xl py-16 px-4 sm:py-16 sm:px-6 lg:max-w-7xl lg:px-8">
        {/* <div className="profile__card relative bottom-[12rem]">
                  <Image className='rounded-lg ' src={profileImg} width={250} height={250} alt={''}></Image>
                  <div className='mt-8  bg-gray-200 rounded-lg p-4'>
                    <h2 className='text-2xl font-bol'>Kai Kongs</h2>
                    <p className='mt-2'>The first ever algorithmically generated PFP collection on KardiaChain. There are 10,000 Kongs running rampant on the KardiaChain Network!</p>
                  </div>
                </div> */}


        <div className='flex justify-between mb-12 items-end'>
          <button className="text-sm sm:text-2xl font-bold tracking-tight bg-[#f6f4f0] w-fit p-4 rounded-lg" onClick={fetchNFTs}>Your NFTs On Sale ({onSale})</button>

          <a href="/kongs">Check Holdings &rarr;</a>
        </div>

        <div className='wallet_btn w-[12rem] '>
          {!wallet && (
            <button onClick={connectWallet} className="w-full flex justify-center gap-x-4 items-center bg-[#44912d] text-white hover:bg-[sky-700] font-bold py-2 px-4 rounded-lg inline-flex"> Connect <img src="/metamask.png" width='30' alt="metamask icon" /> </button>
          )}
        </div>

        {wallet && (
          <div className=" grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {/* {holdings.map(nft => (
                            <HoldingCard name={nft.name} image={nft.image} id={nft.id}></HoldingCard>
                        ))} */}
            {onSale < 1 ? (
              <p className='text-xl p-2 bg-red-400 rounded-lg'>No NFTs found.</p>
            ) : holdings.length == 0 && (
              <span className="loader"></span>
            )}

            {paginateHoldings.map(nft => (
              <div key={nft.id} className="group relative bg-[#f6f4f0] rounded-lg">
                <a href={`/nft/${nft.token}`}>
                  <div className="min-h-80 aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md  lg:aspect-none lg:h-80">
                    <img placeholder='blur' src={nft.image} alt={nft.name} className="h-full w-full object-cover object-center lg:h-full lg:w-full" />
                  </div>
                  <div className='p-4 flex justify-between items-center'>
                    <span className='p-2'>{nft.name}</span>
                    <span className='text-sm'>Rank #{nft.rank}</span>
                  </div>
                </a>
              </div>
            ))}
          </div>
        )}

        <Pagination items={onSale} pageSize={pageSize} currentPage={currentPage} onPageChange={handlePageChange} />
      </div>
    </div>
  )
}

export default Holdings
