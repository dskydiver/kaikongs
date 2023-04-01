// @ts-nocheck
import React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import axios from "axios";
import {ethers} from "ethers";
import { useQuery, gql } from "@apollo/client";
import Pagination from "../components/Pagination";
import paginate from "../utils/paginate";
import metadataJSON from "../public/_metadata_with_rarity.json";
import convertIPFSPath from "../utils/convertIPFSPath";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faList,
  faTableCells,
  faTableCellsLarge,
  faChart,
} from "@fortawesome/free-solid-svg-icons";
import { Dropdown } from "flowbite-react";

declare var window: any;

const CollectedNftsQuery = gql`
  query nfts($address: String) {
    nfts(where: { owner_: { address: $address } }) {
      id
      compiler
      date
      description
      dna
      edition
      image
      tokenID
      name
      tokenURI
    }
  }
`;

const Holdings = () => {
  const pageSize = useMemo(() => {
    return 1;
  }, []);
  const [avatar, setAvatar] = useState("/avatar.png");
  const [wallet, setWallet] = useState('');
  const [collectedNfts, setCollectedNfts] = useState([])
  const [holdings, setHoldings] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  

  const inputRef = useRef(null);

  const {
    data: _dataCollected,
    loading: _loadingCollected,
    error: _errorCollected,
    fetchMore: _fetchMoreCollected
  } = useQuery(CollectedNftsQuery, {
    variables: {
      offset: 0,
      limit: pageSize,
      address: wallet.toLowerCase(),
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
    if (wallet) {
      console.log(process.env.NEXT_PUBLIC_FILEBASE_PROFILE_BUCKET_NAME);
      axios
        .get(
          `${process.env.NEXT_PUBLIC_FILEBASE_S3_ENDPOINT}${process.env.NEXT_PUBLIC_FILEBASE_PROFILE_BUCKET_NAME}/profile/${wallet}`
        )
        .then(() => {
          setAvatar(
            `${process.env.NEXT_PUBLIC_FILEBASE_S3_ENDPOINT}${process.env.NEXT_PUBLIC_FILEBASE_PROFILE_BUCKET_NAME}/profile/${wallet}`
          );
        })
        .catch((err) => {
          console.log(err);
        });
      _fetchMoreCollected({
        variables: {
          offset: (currentPage - 1) * pageSize,
          limit: pageSize,
          address: wallet.toLowerCase(),
        },
      }).then(({data, loading, error}) => {
        if (data && data.nfts) {
          setCollectedNfts(data.nfts);
        }
      })
      .catch(err => console.log(err));
    }
  }, [_fetchMoreCollected, currentPage, pageSize, wallet]);

  useEffect(() => {
    getCurrentWallet();
    walletListener();
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFileChange = ({ target }) => {
    console.log("clicked");
    const fileReader = new FileReader();

    fileReader.readAsDataURL(target.files[0]);
    fileReader.onload = async (e) => {
      console.log("loaded");
      setAvatar(e.target.result);
      const data = new FormData();
      data.append("file", target.files[0]);
      data.append("address", wallet);
      await axios.post("/api/upload", data);
    };
  };

  return (
    <div className="w-full min-h-screen holdings__wrapper">
      <div className="top__bar cover__pg w-full text-center bg-gray-200 py-2 min-h-[20rem]"></div>
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="mb-6 sm:-mt-24 lg:-mt-32">
          <div className="relative w-32 h-32 border-4 border-white bg-[#eeeeee] rounded-full cursor-pointer sm:w-32 sm:h-32 lg:w-40 lg:h-40 lg:border-8">
            <img
              className="rounded-full w-full h-full"
              src={avatar}
              alt="avatar"
            />
            <button
              className="bg-[#dddddd00] hover:bg-[#dddddd77]  w-full h-full rounded-full absolute inset-0"
              onClick={() => inputRef.current?.click()}
            ></button>
            <input
              type="file"
              name="avatar"
              ref={inputRef}
              accept=".jpg, .jpeg, .png"
              onChange={handleFileChange}
              hidden
            />
          </div>
        </div>

        {wallet && (
          <div className="mb-4">
            <p className="text-sm md:text-base">
              {wallet.slice(0, 6)}
              {"..."}
              {wallet.slice(-4)}
            </p>
          </div>
        )}

        <div className="flex justify-between mb-12 items-end">
          <a className="text-sm sm:text-lg" href="/kongs-onsale">
            Check Your NFTs On Sale &rarr;
          </a>
        </div>

        <div className="wallet_btn w-[12rem] mt-12">
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

        <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
          <ul
            className="flex flex-wrap -mb-px text-sm font-medium text-center"
            id="myTab"
            data-tabs-toggle="#myTabContent"
            role="tablist"
          >
            <li className="mr-2" role="presentation">
              <button
                className="inline-block p-4 border-b-2 rounded-t-lg"
                id="profile-tab"
                data-tabs-target="#profile"
                type="button"
                role="tab"
                aria-controls="profile"
                aria-selected="false"
              >
                Collected
              </button>
            </li>
            <li className="mr-2" role="presentation">
              <button
                className="inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                id="dashboard-tab"
                data-tabs-target="#dashboard"
                type="button"
                role="tab"
                aria-controls="dashboard"
                aria-selected="false"
              >
                Created
              </button>
            </li>
            <li className="mr-2" role="presentation">
              <button
                className="inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                id="settings-tab"
                data-tabs-target="#settings"
                type="button"
                role="tab"
                aria-controls="settings"
                aria-selected="false"
              >
                Favorited
              </button>
            </li>
            <li role="presentation">
              <button
                className="inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                id="contacts-tab"
                data-tabs-target="#contacts"
                type="button"
                role="tab"
                aria-controls="contacts"
                aria-selected="false"
              >
                Activity
              </button>
            </li>
          </ul>
        </div>

        <div className="flex justify-between">
          <div className="relative flex items-center grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                aria-hidden="true"
                className="w-5 h-5 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
            <input
              type="text"
              id="success"
              className="bg-gray-50 border pl-10 h-full border-gray-500 text-gray-900 dark:text-gray-400 placeholder-gray-700 dark:placeholder-gray-500 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-500"
              placeholder="Success input"
            />
          </div>
          <div className="pl-2">
            <div className="border-[1px] p-2 border-gray-400 rounded-[1rem] h-full">
              <button
                id="dropdownDefaultButton"
                data-dropdown-toggle="dropdown"
                className="text-black bg-white focus:outline-none font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                type="button"
              >
                Dropdown button{" "}
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
                className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700"
              >
                <ul
                  className="py-2 text-sm text-gray-700 dark:text-gray-200"
                  aria-labelledby="dropdownDefaultButton"
                >
                  <li>
                    <a
                      href="#"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      Dashboard
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      Settings
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      Earnings
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      Sign out
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="inline-flex rounded-md shadow-sm pl-2" role="group">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-transparent border border-gray-400 rounded-l-lg hover:bg-gray-900 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-900 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700"
            >
              <FontAwesomeIcon className="p-2 text-gray-400" icon={faList} />
            </button>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-transparent border-t border-b border-gray-400 hover:bg-gray-900 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-900 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700"
            >
              <FontAwesomeIcon
                className="p-2 text-gray-400"
                icon={faTableCells}
              />
            </button>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-transparent border-t border-b border-l border-gray-400  hover:bg-gray-900 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-900 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700"
            >
              <FontAwesomeIcon
                className="p-2 text-gray-400"
                icon={faTableCellsLarge}
              />
            </button>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-transparent border border-gray-400 rounded-r-md hover:bg-gray-900 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-900 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700"
            >
              <FontAwesomeIcon className="p-2 text-gray-400" icon={faList} />
            </button>
          </div>
        </div>

        <div className="mt-3" id="myTabContent">
          <div
            className="hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border-[1px]"
            id="profile"
            role="tabpanel"
            aria-labelledby="profile-tab"
          >
            {collectedNfts.length ? (
              <div className=" grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                {
                  collectedNfts.map((nft, index) => {
                    return (
                      <div
                        key={index}
                        className="group relative bg-[#f6f4f0] rounded-lg"
                      >
                        <a href={`/nft/${nft.id}`}>
                          <div className="relative min-h-80 aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md  lg:aspect-none lg:h-80">
                            <Image
                              fill
                              src={convertIPFSPath(nft.image)}
                              alt={nft.name}
                              className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                            />
                          </div>
                          <div className="p-4 flex justify-between items-center">
                            <div>
                              <span>{nft.name}</span> <br />
                            </div>
                          </div>
                        </a>
                      </div>
                    );
                  })
                }
              </div>
            ) : (
              <p className="text-center py-5">No items found for this search</p>
            )}
            <p className="text-center">
              <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                Back to all items
              </button>
            </p>
          </div>
          <div
            className="hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border-[1px]"
            id="dashboard"
            role="tabpanel"
            aria-labelledby="dashboard-tab"
          >
            <p className="text-center py-5">No items found for this search</p>
            <p className="text-center">
              <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                Back to all items
              </button>
            </p>
          </div>
        </div>
        {/* {wallet && (
          <div className="mt-12 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {holdings.map(nft => (
                            <HoldingCard name={nft.name} image={nft.image} id={nft.id}></HoldingCard>
                        ))}
            {balance < 1 ? (
              <p className="text-xl p-2 bg-red-400 rounded-lg">
                No NFTs found.
              </p>
            ) : (
              holdings.length == 0 && <span className="loader"></span>
            )}

            {paginateHoldings.map((nft) => (
              <div
                key={nft.id}
                className="group relative bg-[#f6f4f0] rounded-lg"
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
                    <span className="p-2">{nft.name}</span>
                    <span className="text-sm">Rank #{nft.rank}</span>
                  </div>
                </a>
              </div>
            ))}
          </div>
        )} */}

        {/* <Pagination
          items={balance}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        /> */}
      </div>
    </div>
  );
};

export default Holdings;
