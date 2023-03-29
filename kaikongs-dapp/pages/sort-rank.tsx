// @ts-nocheck
import React from "react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Pagination from "../components/Pagination";
import paginate from "../utils/paginate";
import profileImg from "../public/card.jpg";
import metadataJSON from "../public/_metadata_with_rarity.json";

declare var window: any;

// const Holdings = ({ totalItems, floorToken, floorPrice, volume }) => {
const Holdings = () => {
  // console.log(itemsListed);
  const [currentPage, setCurrentPage] = useState(1);
  const [nftItems, setNftItems] = useState([]);
  // metrics variables
  const [floorToken, setFloorToken] = useState();
  const [floorPrice, setFloorPrice] = useState();
  const [totalItems, setTotalItems] = useState();
  const [volume, setVolume] = useState();

  const pageSize = 20;
  const dataFetchedRef = useRef(false);

  const Web3 = require("web3");
  const rpcURL = "https://rpc-2.kardiachain.io";

  // console.log(Web3.givenProvider);

  // const web3 = new Web3(Web3.givenProvder || rpcURL);

  const web3 = new Web3(rpcURL);

  const nftContractABI = require("../utils/contract-abi.json");
  const nftContractAddress = "0xe83a69C8CD50d681895602ACdEC81F7847E70fde";
  let nftContract = new web3.eth.Contract(nftContractABI, nftContractAddress);

  // marketplace
  const contractABI = require("../utils/marketplace-contract-abi.json");
  const contractAddress = "0xC595e0D9dd590c82F415c00A770755a5D3B626BC";

  let contract = new web3.eth.Contract(contractABI, contractAddress);
  let rawdata;

  let paginateHoldings = paginate(nftItems, currentPage, pageSize);

  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    fetchNFTs();
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    const floorTokenId = await contract.methods.getFloorTokenId().call();
    setFloorToken(floorTokenId);

    const price = await contract.methods.getPrice(floorTokenId).call();
    setFloorPrice(price);

    const itemsListed = await contract.methods.itemsListed().call();
    setTotalItems(itemsListed);

    const marketVolume = await contract.methods.volume().call();
    setVolume(marketVolume);
  };

  const fetchNFTs = async () => {
    const marketItems = await contract.methods.getListedTokenIds().call();

    const fetchData = async (id) => {
      const tokenMetadataURI = `https://kai-kongs.myfilebase.com/ipfs/bafybeicc7qf4nu6scvwse7xt3g3uadcmf2t467qus75arezj3m57ei4qvq/${id}.json`;
      const tokenMetadata = await fetch(tokenMetadataURI).then((response) =>
        response.json()
      );
      const nft = metadataJSON.find(
        (nft) => +nft.edition === +tokenMetadata.name.split("#")[1]
      );
      return nft.rank;
    };

    const rankMap = await Promise.all(marketItems.map(fetchData));

    const combinedArray = marketItems.map((id, index) => ({
      id,
      rank: rankMap[index],
    }));
    // console.log(combinedArray);

    // sort the combined array by rank
    combinedArray.sort((a, b) => a.rank - b.rank);

    // extract the sorted tokenIds from the sorted array
    const sortedTokenIds = combinedArray.map((item) => item.id);

    for (let i = 0; i < sortedTokenIds.length; i++) {
      // let tokenMetadataURI = await nftContract.methods.tokenURI(marketItems[i]).call();
      // console.log(marketItems[i], tokenMetadataURI);

      const tokenMetadataURI = `https://kai-kongs.myfilebase.com/ipfs/bafybeicc7qf4nu6scvwse7xt3g3uadcmf2t467qus75arezj3m57ei4qvq/${sortedTokenIds[i]}.json`;

      const tokenMetadata = await fetch(tokenMetadataURI).then((response) =>
        response.json()
      );

      // console.log(tokenMetadata);

      const nft = metadataJSON.find((nft) => {
        return +nft.edition === +tokenMetadata.name.split("#")[1];
      });

      // let tokenImage = tokenMetadata.image;
      // console.log(tokenImage);
      let tokenImage = `https://kai-kongs.myfilebase.com/ipfs/QmfRujWJEhn53psXwBuobFPFmLkWrYx2HcWb1sGTunKoxf/${nft.edition}.png`;
      const tokenName = nft.name;

      const tokenPrice = await contract.methods
        .getPrice(sortedTokenIds[i])
        .call();

      setNftItems((nftItems) => [
        ...nftItems,
        {
          id: nftItems.length,
          name: tokenName,
          image: tokenImage,
          token: sortedTokenIds[i],
          tokenPrice: tokenPrice,
          rank: nft.rank,
        },
      ]);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="w-full min-h-screen holdings__wrapper">
      <div className="top__bar cover__pg w-full text-center bg-gray-100 py-2 min-h-[20rem]"></div>
      <div className="mx-auto mb-[5rem] max-w-2xl py-16 px-4 sm:py-16 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="profile__card relative bottom-[12rem]">
          <div className="flex flex-wrap gap-4 items-end">
            <Image
              className="rounded-lg "
              src={profileImg}
              placeholder="blur"
              width={250}
              height={250}
              alt={"Kai Kongs"}
            ></Image>
            <div className="flex flex-wrap mt-4 gap-3">
              <div className="bg-gray-100 w-full sm:w-fit p-4 rounded-lg">
                <span>{volume} KAI</span> <br></br>
                <span className="text-sm text-gray-600">Total Volume</span>
              </div>

              <div className="bg-gray-100 w-full sm:w-fit p-4 rounded-lg">
                <span>{totalItems} Kongs</span> <br></br>
                <span className="text-sm text-gray-600">Listed</span>
              </div>

              <div className="bg-gray-100 w-full sm:w-fit p-4 rounded-lg">
                <span>10,000</span> <br></br>
                <span className="text-sm text-gray-600">Total Kongs</span>
              </div>

              <div className="bg-gray-100 w-full sm:w-fit p-4 rounded-lg">
                <a href={`/nft/${floorToken}`}>{floorPrice} KAI</a> <br />
                <span className="text-sm text-gray-600">Floor Price</span>
              </div>
            </div>
          </div>
          <div className="mt-8  bg-gray-100 rounded-lg p-4">
            <h2 className="text-2xl font-bol">Kai Kongs</h2>
            <p className="mt-2">
              The first ever personalized algorithmically generated PFP
              collection on the KardiaChain network created by Moto. The goal of
              this collection is to bring together the KardiaChain community
              with personalized Kong PFPs which depict their personality, style,
              and who they are as a person.
            </p>
          </div>
        </div>

        <div className="mt-[-10rem]">
          <div className="flex justify-end mb-5">
            <button
              id="dropdownDefaultButton"
              data-dropdown-toggle="dropdown"
              className="font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center"
              type="button"
            >
              Sort By{" "}
              <svg
                className="w-4 h-4 ml-2"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </button>

            <div
              id="dropdown"
              className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow"
            >
              <ul
                className="py-2 w-fit text-sm text-gray-700 "
                aria-labelledby="dropdownDefaultButton"
              >
                <a
                  href="/sort-rank"
                  id="r-h-l"
                  className="active__option block w-full px-4 py-2 hover:bg-gray-100"
                >
                  Rank, High To Low
                </a>

                <a
                  href="/sort-price-lh"
                  id="p-l-h"
                  className="block w-full px-4 py-2 hover:bg-gray-100"
                >
                  Price, Low To High
                </a>

                <a
                  href="/sort-price-hl"
                  id="p-h-l"
                  className="block w-full px-4 py-2 hover:bg-gray-100"
                >
                  Price, High To Low
                </a>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {nftItems.length < 1 && (
              <p className="text-xl p-2 bg-red-400 rounded-lg">
                No NFTs found.
              </p>
            )}

            {paginateHoldings.map((nft) => (
              <div
                key={nft.id}
                className="group relative bg-gray-100 rounded-lg"
              >
                <a href={`/nft/${nft.token}`}>
                  <div className="min-h-80 aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md  lg:aspect-none lg:h-80">
                    <img
                      placeholder="blur"
                      src={nft.image}
                      alt={nft.name}
                      className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                    />
                  </div>
                  <div className="p-4 flex justify-between items-center">
                    <div>
                      <span>{nft.name}</span> <br />
                      <span className="text-xs">Rank #{nft.rank}</span>
                    </div>
                    <span className="text-sm">
                      {nft.tokenPrice.length > 5
                        ? `${nft.tokenPrice}`.slice(0, 5) + ".."
                        : nft.tokenPrice}{" "}
                      KAI
                    </span>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>

        <Pagination
          items={nftItems.length}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/1.6.3/flowbite.min.js"></script>
    </div>
  );
};

// export async function getServerSideProps(context) {
//   const Web3 = require('web3')
//   const rpcURL = "https://rpc-2.kardiachain.io"
//   const web3 = new Web3(Web3.givenProvider || rpcURL);

//   const contractABI = require('../utils/marketplace-contract-abi.json');
//   const contractAddress = "0xC595e0D9dd590c82F415c00A770755a5D3B626BC";

//   let contract = new web3.eth.Contract(contractABI, contractAddress);

//   const floorTokenId = await contract.methods.getFloorTokenId().call();
//   // setFloorToken(floorTokenId);

//   const price = await contract.methods.getPrice(floorTokenId).call();
//   // setFloorPrice(price);

//   const itemsListed = await contract.methods.itemsListed().call();
//   // setTotalItems(itemsListed);

//   const marketVolume = await contract.methods.volume().call();
//   // setVolume(marketVolume);

//   return {
//     props: { totalItems: itemsListed, floorPrice: price, floorToken: floorTokenId, volume: marketVolume }, // will be passed to the page component as props
//   }
// }

export default Holdings;
