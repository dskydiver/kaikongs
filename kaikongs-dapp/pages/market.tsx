import React from "react";
import Image from "next/image";
import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, gql } from "@apollo/client";
import Pagination from "../components/Pagination";
import paginate from "../utils/paginate";
import profileImg from "../public/card.jpg";
import metadataJSON from "../public/_metadata_with_rarity.json";
import convertIPFSPath from "../utils/convertIPFSPath";

declare var window: any;

const ListedNftsQuery = gql`
  query ListedNfts($offset: Int, $limit: Int) {
    listNFTs(skip: $offset, first: $limit) {
      id
      price
      nft {
        image
        tokenURI
        id
        owner {
          id
          address
        }
        description
        dna
        edition
        date
        compiler
        tokenID
        name
      }
      sold
      date
      seller {
        address
        id
      }
    }
  }
`;

// const Holdings = ({ totalItems, floorToken, floorPrice, volume }) => {
const Holdings = () => {
  // console.log(itemsListed);
  const pageSize = useMemo(() => {
    return 1
  }, [])

  const { data: _data, loading: _loading, error: _error, fetchMore } = useQuery(ListedNftsQuery, {
    variables: {
      offset: 0,
      limit: pageSize
    }
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(_loading)
  const [error, setError] = useState(_error)
  const [data, setData] = useState(_data);
  // const [sortedNftItems, setSortedNftItems] = useState([]);
  // const [floorToken, setFloorToken] = useState();
  // const [floorPrice, setFloorPrice] = useState();
  // const [totalItems, setTotalItems] = useState();
  // const [volume, setVolume] = useState();
  // const dataFetchedRef = useRef(false);

  // const Web3 = require("web3");
  // // const rpcURL = "https://rpc.kardiachain.io"
  // const rpcURL = "https://rpc-2.kardiachain.io/";

  // // console.log(Web3.givenProvider);

  // const web3 = new Web3(Web3.givenProvder || rpcURL);

  // const nftContractABI = require("../utils/contract-abi.json");
  // const nftContractAddress = "0xe83a69C8CD50d681895602ACdEC81F7847E70fde";
  // let nftContract = new web3.eth.Contract(nftContractABI, nftContractAddress);

  // // marketplace
  // const contractABI = require("../utils/marketplace-contract-abi.json");
  // const contractAddress = "0xC595e0D9dd590c82F415c00A770755a5D3B626BC";

  // let contract = new web3.eth.Contract(contractABI, contractAddress);
  // let rawdata;

  // let paginateHoldings = paginate(nftItems, currentPage, pageSize);

  // useEffect(() => {
  //   if (dataFetchedRef.current) return;
  //   dataFetchedRef.current = true;
  //   fetchNFTs();
  //   fetchMetrics();
  // }, []);

  // const fetchMetrics = async () => {
  //   const floorTokenId = await contract.methods.getFloorTokenId().call();
  //   setFloorToken(floorTokenId);

  //   const price = await contract.methods.getPrice(floorTokenId).call();
  //   setFloorPrice(price);

  //   const itemsListed = await contract.methods.itemsListed().call();
  //   setTotalItems(itemsListed);

  //   const marketVolume = await contract.methods.volume().call();
  //   setVolume(marketVolume);
  // };


  // const removeActiveOption = () => {
  //   const option = document.querySelector(".active__option");

  //   if (option !== null) {
  //     option.classList.remove("active__option");
  //   }
  // };

  // const rankHighToLow = () => {
  //   const dropdown = document.getElementById("dropdown");
  //   dropdown.classList.toggle("hidden");

  //   removeActiveOption();

  //   const option = document.getElementById("r-h-l");
  //   option.classList.toggle("active__option");
  //   const sortedNfts = nftItems.sort(function (a, b) {
  //     return a.rank - b.rank;
  //   });
  //   setSortedNftItems(sortedNfts);
  //   // console.log(sortedNftItems);
  // };

  // const priceLowToHigh = () => {
  //   const dropdown = document.getElementById("dropdown");
  //   dropdown.classList.toggle("hidden");

  //   removeActiveOption();

  //   const option = document.getElementById("p-l-h");
  //   option.classList.toggle("active__option");
  //   console.log(nftItems);
  //   const sortedNfts = nftItems.sort(function (a, b) {
  //     return a.tokenPrice - b.tokenPrice;
  //   });
  //   console.log(sortedNftItems);
  //   setSortedNftItems(sortedNfts);
  // };

  // const priceHighToLow = () => {
  //   const dropdown = document.getElementById("dropdown");
  //   dropdown.classList.toggle("hidden");

  //   removeActiveOption();

  //   const option = document.getElementById("p-h-l");
  //   option.classList.toggle("active__option");
  //   console.log(nftItems);
  //   const sortedNfts = nftItems.sort(function (a, b) {
  //     return b.tokenPrice - a.tokenPrice;
  //   });
  //   console.log(sortedNftItems);
  //   setSortedNftItems(sortedNfts);
  // };

  const handlePageChange = async (page) => {
    console.log(page)
    const { data, loading, error } = await fetchMore({
      variables: {
        offset: (page - 1) * pageSize
      }
    })
    setData(data);
    setLoading(loading);
    setError(error);
    setCurrentPage(page);
  };

  // if (sortedNftItems.length > 0) {
  //   let paginateHoldings = paginate(sortedNftItems, currentPage, pageSize);
  // }

  // // useEffect(() => {
  // //   paginateHoldings = paginate(nftItems, currentPage, pageSize)
  // //   console.log("Updated!!")
  // // }, [nftItems])

  useEffect(() => {
    setData(_data);
  }, [_data])

  useEffect(() => {
    setLoading(_loading);
  }, [_loading])

  useEffect(() => {
    setError(_error);
  }, [_error])
  
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
            {/* <div className="flex flex-wrap mt-4 gap-3">
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
           </div> */}
          </div>
          <div className="mt-8  bg-gray-100 rounded-lg p-4">
            <h2 className="text-2xl font-bol">Kai Kongs</h2>
            <p className="mt-2">
              {`The first ever personalized algorithmically generated PFP
             collection on the KardiaChain network created by Moto. The goal of
             this collection is to bring together the KardiaChain community
             with personalized Kong PFPs which depict their personality, style,
             and who they are as a person.`}
            </p>
          </div>
        </div>

        <div className="mt-[-10rem]">
          {/* <div className="flex justify-end mb-5">
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
               <li>
                 <button
                   onClick={rankHighToLow}
                   id="r-h-l"
                   className="block w-full px-4 py-2 hover:bg-gray-100"
                 >
                   Rank, High To Low
                 </button>

                 <button
                   onClick={priceLowToHigh}
                   id="p-l-h"
                   className="block w-full px-4 py-2 hover:bg-gray-100"
                 >
                   Price, Low To High
                 </button>

                 <button
                   onClick={priceHighToLow}
                   id="p-h-l"
                   className="block w-full px-4 py-2 hover:bg-gray-100"
                 >
                   Price, High To Low
                 </button>
               </li>
             </ul>
           </div>
         </div> */}

          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {loading && <div>loading</div>}
            {error && <div>Error occurred when fetching from graphql</div>}
            {!loading &&
              !error &&
              data.listNFTs.map((listedNft, index) => (
                <div
                  key={index}
                  className="group relative bg-gray-100 rounded-lg"
                >
                  <a href={`/nft/${listedNft.nft.id}`}>
                    <div className="relative min-h-80 aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md  lg:aspect-none lg:h-80">
                      <Image
                        fill
                        src={convertIPFSPath(listedNft.nft.image)}
                        alt={listedNft.nft.name}
                        className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                      />
                    </div>
                    <div className="p-4 flex justify-between items-center">
                      <div>
                        <span>{listedNft.name}</span> <br />
                      </div>
                      <span className="text-sm">
                        {listedNft.price.length > 5
                          ? `${listedNft.price}`.slice(0, 5) + ".."
                          : listedNft.price}{" "}
                        KAI
                      </span>
                    </div>
                  </a>
                </div>
              ))}
          </div>
        </div>
        
       <Pagination
         items={2}
         pageSize={pageSize}
         currentPage={currentPage}
         onPageChange={handlePageChange}
       />
      </div>
    </div>
  );
};

export default Holdings;
