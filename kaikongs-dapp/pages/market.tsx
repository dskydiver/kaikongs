import React from "react";
import Image from "next/image";
import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, gql } from "@apollo/client";
import Pagination from "../components/Pagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import paginate from "../utils/paginate";
import profileImg from "../public/card.jpg";
import metadataJSON from "../public/_metadata_with_rarity.json";
import convertIPFSPath from "../utils/convertIPFSPath";
import {
  faSearch,
  faList,
  faTableCells,
  faTableCellsLarge,
} from "@fortawesome/free-solid-svg-icons";

declare var window: any;

var SORTLABELS = ['Price low to high', 'Price high to low', 'Recently listed']

const ListedNftsQuery = gql`
  query ListedNfts($offset: Int, $limit: Int, $orderDirection: String, $orderBy: String) {
    listNFTs(
      skip: $offset
      first: $limit
      orderDirection: $orderDirection
      orderBy: $orderBy
    ) {
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
      limit: pageSize,
      orderDirection: 'asc',
      orderBy: 'price'
    }
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(_loading)
  const [error, setError] = useState(_error)
  const [data, setData] = useState(_data);
  const [sortId, setSortId] = useState(0)


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



  const handleDropdownClick = (id: number) => async () => {
    setSortId(id)

    switch (id) {
      case 0:
        const {data, loading, error} = await fetchMore({
          variables: {
            offset: 0,
            limit: pageSize,
            orderDirection: "asc",
            orderBy: "price",
          },
        });
        setData(data)
        setLoading(loading)
        setError(error)
        break;
      case 1:
        const {data: _data, loading: _loading, error: _error} = await fetchMore({
          variables: {
            offset: 0,
            limit: pageSize,
            orderDirection: "desc",
            orderBy: "price",
          },
        });
        setData(_data)
        setLoading(_loading)
        setError(_error)
        break;
      case 2:
        const {data: __data, loading: __loading, error: __error} = await fetchMore({
          variables: {
            offset: 0,
            limit: pageSize,
            orderDirection: "desc",
            orderBy: "date",
          },
        });
        setData(__data)
        setLoading(__loading)
        setError(__error)
        break;
    }
  }

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
                  {SORTLABELS[sortId]}{" "}
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
                    {SORTLABELS.map((label, index) => (
                      <li key={index}>
                        <button
                          className="block w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                          onClick={handleDropdownClick(index)}
                        >
                          {label}
                        </button>
                      </li>
                    ))}
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
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8 mt-5">
            {loading && <div>loading</div>}
            {error && <div>Error occurred when fetching from graphql</div>}
            {!loading &&
              !error &&
              data.listNFTs.map((listedNft, index) => (
                <div
                  key={index}
                  className="group relative bg-gray-100 rounded-lg"
                >
                  
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
