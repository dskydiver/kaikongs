import React from "react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useQuery, gql } from "@apollo/client";
import { at } from "lodash";
import { BsArrowDown } from "react-icons/bs";
import { type } from "os";
import metadataJSON from "../../public/_metadata_with_rarity.json";
import convertIPFSPath from '../../utils/convertIPFSPath';

declare var window: any;

const ListedNftQuery = gql`
  query ListedNft($id: ID) {
    listNFT(id: $id) {
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

const Nft = () => {
  const router = useRouter();
  const { id } = router.query;
  const {
    data: _data,
    loading: _loading,
    error: _error,
  } = useQuery(ListedNftQuery, {
    variables: {
      id
    },
  });
  const [loading, setLoading] = useState(_loading);
  const [error, setError] = useState(_error);
  const [data, setData] = useState(_data);
  const [wallet, setWallet] = useState();
  // const [nftTraits, setnftTraits] = useState([]);
  // const [imageUrl, setImageUrl] = useState<any | null>(null);
  // const [tokeName, setTokenName] = useState();
  // const [tokenRank, setTokenRank] = useState();

  // const [isListed, setIsListed] = useState();
  // const [tokenPrice, setTokenPrice] = useState();
  // const [tokenOwner, setTokenOwner] = useState();

  const [isOwner, setIsOwner] = useState(false);
  const [status, setStatus] = useState({ message: null, type: null });

  // const [pageLoading, setPageLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  let tokenMetadata;

  // const Web3 = require('web3');
  // let web3 = new Web3(Web3.givenProvider);

  const Web3 = require("web3");
  const rpcURL = "https://rpc-2.kardiachain.io";
  const web3 = new Web3(Web3.givenProvider || rpcURL);

  // marketplace
  const contractABI = require("../../utils/marketplace-contract-abi.json");
  const contractAddress = "0xC595e0D9dd590c82F415c00A770755a5D3B626BC";
  let marketplace = new web3.eth.Contract(contractABI, contractAddress);
  // nft
  const nftContractABI = require("../../utils/contract-abi.json");
  const nftContractAddress = "0xe83a69C8CD50d681895602ACdEC81F7847E70fde";

  let nftContract = new web3.eth.Contract(nftContractABI, nftContractAddress);

  const [price, setPrice] = useState<any | null>(null);
  const [recipient, setRecipient] = useState<any | null>(null);
  const [processing, setProcessing] = useState(false);

  const handlePriceChange = (event) => {
    setPrice(event.target.value);
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = accounts[0];
      setWallet(account);
    } else {
      window.open("https://metamask.io/", "_blank");
    }
  };

  async function getCurrentWallet(): Promise<void> {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      const account = accounts[0];
      // console.log(account);
      setWallet(account);
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

  // // const getStatus = async

  const listSale = async () => {
    setIsLoading(true);
    if (price % 1 == 0 && price > 0) {
      try {
        // console.log(Web3.utils.toWei(`${price}`, 'ether'));

        const isApproved = await nftContract.methods
          .isApprovedForAll(wallet, contractAddress)
          .call();

        if (!isApproved) {
          await nftContract.methods
            .setApprovalForAll(contractAddress, true)
            .send({ from: wallet });
        }

        const tx = await marketplace.methods
          .listMarketItem(nftContractAddress, id, price)
          .send({ from: wallet });
        await tx;

        setIsLoading(false);
        location.reload();
        setStatus({ message: "Listed successfully", type: "success" });
      } catch (err) {
        setStatus({ message: err.message, type: "error" });
        setIsLoading(false);
      }
    } else {
      setStatus({
        message: "Price can be in only whole numbers. Min. 1 KAI",
        type: "error",
      });
      setIsLoading(false);
    }
  };

  const buyItem = async () => {
    setIsLoading(true);
    try {
      // console.log();
      await marketplace.methods.createMarketSale(nftContractAddress, id).send({
        from: wallet,
        value: web3.utils.toWei(`${data?.listNFT.price}`, "ether"),
      });
      location.reload();
      setStatus({ message: "Purchase successful", type: "success" });
    } catch (err) {
      setStatus({ message: err.message, type: "error" });
      setIsLoading(false);
    }
    // "0x" + Web3.utils.toBN(Web3.utils.toWei(``, "ether")).toString(16)}
  };

  const removeListing = async () => {
    setIsLoading(true);
    try {
      const tx = await marketplace.methods
        .removeListing(id, nftContractAddress)
        .send({ from: wallet });
      await tx;

      location.reload();
      setStatus({ message: "Successfully removed listing", type: "success" });
    } catch (err) {
      setStatus({ message: err.message, type: "error" });
      setIsLoading(false);
    }
  };

  const transferToken = async () => {
    setProcessing(true);
    try {
      const tx = await nftContract.methods
        .transferFrom(wallet, recipient, id)
        .send({ from: wallet });
      await tx;
      location.reload();
      setStatus({ message: "Transfer Successful", type: "success" });
    } catch (err) {
      setStatus({ message: err.message, type: "error" });
      setProcessing(false);
    }
  };

  // const fetchMetadata = async () => {
  //   let tokenMetadataURI = `https://kai-kongs.myfilebase.com/ipfs/bafybeicc7qf4nu6scvwse7xt3g3uadcmf2t467qus75arezj3m57ei4qvq/${id}.json`;
  //   tokenMetadata = await fetch(tokenMetadataURI).then((response) =>
  //     response.json()
  //   );

  //   const listingStatus = await marketplace.methods.isListed(id).call();
  //   setIsListed(listingStatus);

  //   const price = await marketplace.methods.getPrice(id).call();
  //   setTokenPrice(price);

  //   if (listingStatus == true) {
  //     let owner = await marketplace.methods.getSeller(id).call();
  //     owner = owner.toLowerCase();
  //     setTokenOwner(owner);
  //     console.log(wallet);
  //     if (owner == wallet) {
  //       setIsOwner(true);
  //     }
  //   } else {
  //     let owner = await nftContract.methods.ownerOf(id).call();
  //     console.log(owner);
  //     console.log(wallet);
  //     owner = owner.toLowerCase();
  //     setTokenOwner(owner.toLowerCase());

  //     if (owner == wallet) {
  //       setIsOwner(true);
  //     }
  //   }

  //   // if (listingStatus == true){
  //   //     console.log(true);
  //   //     const owner = await marketplace.methods.getSeller(id).call();
  //   //     console.log(owner);

  //   //     console.log(wallet)
  //   // }

  //   setTokenName(tokenMetadata.name);

  //   const nft = metadataJSON.find(
  //     (nft) => +nft.edition === +tokenMetadata.name.split("#")[1]
  //   );
  //   setTokenRank(nft.rank);

  //   setnftTraits([]);

  //   nft.attributes.map((attr: any) => {
  //     setnftTraits((nftTraits) => [...nftTraits, attr]);
  //   });

  //   console.log("Atributes Set");

  //   let img = tokenMetadata.image;
  //   setImageUrl(
  //     `https://kai-kongs.myfilebase.com/ipfs/${img.split("ipfs://")[1]}`
  //   );
  //   setPageLoading(false);
  // };

  // useEffect(() => {
  //   if (id != null) {
  //     fetchMetadata();
  //   }
  // }, [id, wallet]);

  // // useEffect(() => {
  // //     console.log(isOwner)
  // // }, [isOwner])

  // // useEffect(() => {
  // //     nftTraits.map(atrr => {
  // //         console.log(attr);
  // //     })
  // // }, [nftTraits])

  // const sentenceCase = (str) => {
  //   if (str === null || str === "") return false;
  //   else str = str.toString();

  //   return str.replace(/\w\S*/g, function (txt) {
  //     return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  //   });
  // }

  useEffect(() => {
    getCurrentWallet();
    walletListener();
  }, []);

  useEffect(() => {
    if (!loading && !error) {
      if (wallet === data.listNFT.nft.owner.address) {
        setIsOwner(true)
      }
      else {
        setIsOwner(false)
      }
    }
  }, [wallet, loading, error, data?.listNFT.nft.owner.address])

  useEffect(() => {
    setData(_data);
  }, [_data]);

  useEffect(() => {
    setLoading(_loading);
  }, [_loading]);

  useEffect(() => {
    setError(_error);
  }, [_error]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center">
        <span className="loader"></span>
      </div>
    );
  } 
  if (error) {
    console.log(error)
    return null
  }

  const listNFT = data.listNFT;

  return (
    <section className="text-gray-600 body-font overflow-hidden">
      <div className="container px-5 py-24 mx-auto">
        <div className="lg:w-4/5 mx-auto flex flex-wrap">
          <img
            className="lg:w-1/2 w-full h-full object-cover object-center rounded"
            src={convertIPFSPath(listNFT.nft.image)}
          />
          <div className="lg:w-1/2 w-full lg:pl-10 lg:py-6 mt-6 lg:mt-0">
            <div className="flex gap-4 items-center">
              <h1 className="text-gray-900 text-3xl title-font font-medium mb-1">
                {listNFT.nft.name}
              </h1>
            </div>
            <span className="text-sm">
              owned by {`${listNFT.nft.owner.address}`.slice(0, 5) + ".."}
            </span>

            <p className="text-lg mt-4 text-black">
              There are 10,000 Kongs running rampant on the KardiaChain Network!
            </p>

         
              <div className="my-6">
                <h2 className="text-black text-2xl flex justify-center items-center gap-2 w-fit">
                  {listNFT.price} KAI{" "}
                  <span className="p-1 bg-gray-100 text-xs rounded-lg">
                    On Sale
                  </span>{" "}
                </h2>
              </div>


            <div className="nft__controlls mt-6">
              <div className="flex gap-2">
                {!wallet ? (
                    <button
                      onClick={connectWallet}
                      className="w-full flex justify-center gap-x-4 items-center bg-[#44912d] text-white hover:bg-[sky-700] font-bold py-2 px-4 rounded-lg inline-flex"
                    >
                      {" "}
                      Connect{" "}
                      <img
                        src="/metamask.png"
                        width="30"
                        alt="metamask icon"
                      />{" "}
                    </button>
                  ) : (
                    wallet &&
                    isOwner && (
                      <div>
                        <div className="flex gap-2">
                          <input
                            disabled={isLoading}
                            type="number"
                            placeholder="KAI"
                            id="price"
                            name="price"
                            className="bg-gray-100 bg-opacity-50 rounded-lg border border-gray-300 focus:border-indigo-500 focus:bg-transparent focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out w-[7rem]"
                            onChange={handlePriceChange}
                          />

                          <button
                            disabled={isLoading}
                            onClick={listSale}
                            className="px-3 py-2 bg-blue-600 rounded-lg text-white"
                          >
                            {isLoading ? "Listing..." : "List For Sale"}
                          </button>
                        </div>

                        <p className="mt-6 border-2 border-black p-2 text-black">
                          Marketplace Royalty: 7.5% Total <br />
                          <b>Royalty Breakdown</b> <br />
                          5% - Project Wallet <br />
                          2.5% - Team <br />
                          All royalties will be used for future airdrops,
                          development, giveaways, events, and more.
                        </p>

                        <div className="transfer__wrapper mt-8">
                          <span className="text-lg mt-4 text-black">
                            Transfer Your NFT
                          </span>
                          <div className="flex gap-2 mt-1">
                            <input
                              disabled={isLoading}
                              type="text"
                              placeholder="Recipient's Address"
                              id="price"
                              name="price"
                              className="bg-gray-100 bg-opacity-50 rounded-lg border border-gray-300 focus:border-indigo-500 focus:bg-transparent focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out w-[13rem]"
                              onChange={(e) => {
                                setRecipient(e.target.value);
                              }}
                            />

                            <button
                              disabled={isLoading}
                              onClick={transferToken}
                              className="px-3 py-2 bg-blue-600 rounded-lg text-white"
                            >
                              {processing ? "Processing..." : "Transfer"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  )
                }

                {!wallet ? (
                    <button
                      onClick={connectWallet}
                      className="w-full flex justify-center gap-x-4 items-center bg-[#44912d] text-white hover:bg-[sky-700] font-bold py-2 px-4 rounded-lg inline-flex"
                    >
                      {" "}
                      Connect{" "}
                      <img
                        src="/metamask.png"
                        width="30"
                        alt="metamask icon"
                      />{" "}
                    </button>
                  ) : wallet && !isOwner ? (
                    <button
                      disabled={isLoading}
                      onClick={buyItem}
                      className="p-3 bg-green-600 rounded-lg text-white"
                    >
                      {isLoading ? "Processing.." : "Buy Now"}
                    </button>
                  ) : (
                    <button
                      disabled={isLoading}
                      onClick={removeListing}
                      className="p-2 mt-6 bg-gray-500 rounded-lg text-white"
                    >
                      Remove Listing
                    </button>
                  )}
              </div>
            </div>

            <div className="nft__desc mt-12">
              <div className="rarity__panel">
                <details>
                  <summary>
                    <h2 className="text-xl text-black flex justify-between items-center w-full">
                      Properties <BsArrowDown />{" "}
                    </h2>
                  </summary>

                  {/* <div className="flex flex-wrap mt-3 gap-4">
                    {nftTraits.map((attr, index) => (
                      <div
                        key={index}
                        className="card bg-gray-200 p-4 rounded-lg"
                      >
                        <h2 className="text-blue-800">{attr.trait_type}</h2>
                        <span>{sentenceCase(attr.value)}</span>
                      </div>
                    ))}
                  </div> */}
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

};

export default Nft;
