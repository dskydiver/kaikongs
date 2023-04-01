// @ts-nocheck
import React, { useMemo } from "react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Pagination from "../components/Pagination";
import paginate from "../utils/paginate";
import profileImg from "../public/card.jpg";
import metadataJSON from "../public/_metadata_with_rarity.json";
import convertIPFSPath from "../utils/convertIPFSPath";
import { useQuery, gql } from "@apollo/client";

declare var window: any;

const SaleQuery = gql`
  query listNFTs($address: String, $offset: Int, $limit: Int) {
    listNFTs(
      where: { seller_: { address: $address }, sold: false }
      skip: $offset
      first: $limit
    ) {
      id
      sold
      price
      seller {
        address
      }
      nft {
        date
        description
        compiler
        dna
        edition
        id
        image
        name
        tokenID
        tokenURI
      }
    }
  }
`;

const Holdings = () => {
  const pageSize = useMemo(() => {
    return 1;
  }, []);

  const [wallet, setWallet] = useState();
  const [holdings, setHoldings] = useState([]);

  const [onSale, setOnSale] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: _data,
    loading: _loading,
    error: _error,
    fetchMore,
  } = useQuery(SaleQuery, {
    variables: {
      offset: 0,
      limit: pageSize,
      address: wallet,
    },
  });

  const connectWallet = async () => {
    if (window.ethereum) {
      await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setWallet(await provider.getSigner().getAddress());
    } else {
      window.open("https://metamask.io/", "_blank");
    }
  };

  async function getCurrentWallet(): Promise<void> {
    if (window.ethereum) {
      await window.ethereum.request({
        method: "eth_accounts",
      });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      // console.log(account);
      setWallet(await provider.getSigner().getAddress());
    }
  }

  const walletListener = () => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        // console.log(accounts[0]);
        setWallet(accounts[0]);
      });
    }
  };

  useEffect(() => {
    getCurrentWallet();
    walletListener();
  }, []);

  useEffect(() => {
    if (_data && _data.listNFTs) {
      setHoldings(_data.listNFTs);
    }
  }, [_data]);

  useEffect(() => {
    if (wallet) {
      fetchMore({
        variables: {
          offset: (currentPage - 1) * pageSize,
          limit: pageSize,
          address: wallet.toLowerCase(),
        },
      })
        .then(({ data, loading, error }) => {
          if (data && data.listNFTs)
            setHoldings(data.listNFTs);
        })
        .catch((error) => console.log(error));
    }
  }, [currentPage, fetchMore, pageSize, wallet]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  console.log(holdings)

  return (
    <div className="w-full min-h-screen holdings__wrapper">
      <div className="top__bar cover__pg w-full text-center bg-gray-200 py-2 min-h-[20rem]"></div>
      <div className="mx-auto max-w-2xl py-16 px-4 sm:py-16 sm:px-6 lg:max-w-7xl lg:px-8">
        {/* <div className="profile__card relative bottom-[12rem]">
                  <Image className='rounded-lg ' src={profileImg} width={250} height={250} alt={''}></Image>
                  <div className='mt-8  bg-gray-200 rounded-lg p-4'>
                    <h2 className='text-2xl font-bol'>Kai Kongs</h2>
                    <p className='mt-2'>The first ever algorithmically generated PFP collection on KardiaChain. There are 10,000 Kongs running rampant on the KardiaChain Network!</p>
                  </div>
                </div> */}

        {/* <div className="flex justify-between mb-12 items-end">
          <button
            className="text-sm sm:text-2xl font-bold tracking-tight bg-[#f6f4f0] w-fit p-4 rounded-lg"
            onClick={fetchNFTs}
          >
            Your NFTs On Sale ({onSale})
          </button>

          <a href="/kongs">Check Holdings &rarr;</a>
        </div> */}

        <div className="wallet_btn w-[12rem] ">
          {!wallet && (
            <button
              onClick={connectWallet}
              className="w-full flex justify-center gap-x-4 items-center bg-[#44912d] text-white hover:bg-[sky-700] font-bold py-2 px-4 rounded-lg inline-flex"
            >
              {" "}
              Connect <img
                src="/metamask.png"
                width="30"
                alt="metamask icon"
              />{" "}
            </button>
          )}
        </div>

        {wallet && (
          <div className=" grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {holdings.length < 1 ? (
              <p className="text-xl p-2 bg-red-400 rounded-lg">
                No NFTs found.
              </p>
            ) : (
              <></>
            )}

            {holdings.map((listedNft) => (
              <div
                key={listedNft.id}
                className="group relative bg-[#f6f4f0] rounded-lg"
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
        )}

        <Pagination
          items={onSale}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default Holdings;
