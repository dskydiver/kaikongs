import React from "react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useQuery, gql } from "@apollo/client";
import { ethers } from "ethers";
import { at } from "lodash";
import { BsArrowDown } from "react-icons/bs";
import { type } from "os";
import kaiKongMetadataJSON from "../../public/_metadata_with_rarity.json";
import convertIPFSPath from "../../utils/convertIPFSPath";
import marketplaceABI from "../../utils/marketplace-contract-abi.json";
import nftContractABI from "../../utils/contract-abi.json";
import compareAddress from "../../utils/compareAddress";

declare var window: any;

const NftQuery = gql`
  query nft($id: ID) {
    nft(id: $id) {
      id
      listNFTs(where: { canceled: false, sold: false }) {
        sold
        canceled
        price
        id
        date
        seller {
          address
        }
      }
      image
      tokenID
      tokenURI
      name
      owner {
        address
        id
      }
      edition
      dna
      description
      date
      compiler
      collection {
        address
        id
        baseURI
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
  } = useQuery(NftQuery, {
    variables: {
      id,
    },
  });
  const [loading, setLoading] = useState(_loading);
  const [error, setError] = useState(_error);
  const [data, setData] = useState(_data);
  const [wallet, setWallet] = useState("");
  const [nftTraits, setnftTraits] = useState([]);
  // const [imageUrl, setImageUrl] = useState<any | null>(null);
  // const [tokeName, setTokenName] = useState();
  const [tokenRank, setTokenRank] = useState();

  const [isListed, setIsListed] = useState(true);
  // const [tokenPrice, setTokenPrice] = useState();
  // const [tokenOwner, setTokenOwner] = useState();

  const [isOwner, setIsOwner] = useState(false);
  const [status, setStatus] = useState({ message: null, type: null });

  // const [pageLoading, setPageLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [price, setPrice] = useState<any | null>(null);
  const [recipient, setRecipient] = useState<any | null>(null);
  const [processing, setProcessing] = useState(false);

  const handlePriceChange = (event) => {
    setPrice(event.target.value);
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      let wallet = "";
      try {
        wallet = await provider.getSigner().getAddress();
        setWallet(wallet);
      } catch (err) {}
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
      let wallet = "";
      try {
        wallet = await provider.getSigner().getAddress();
        setWallet(wallet);
      } catch (err) {}
      // console.log(account);
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
    let provider = new ethers.providers.Web3Provider(window.ethereum);
    let marketplace = new ethers.Contract(
      process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS,
      marketplaceABI,
      provider.getSigner()
    );
    let nftContractAddress = data.nft.collection.address;
    let tokenId = data.nft.tokenID;

    let nftContract = new ethers.Contract(
      nftContractAddress,
      nftContractABI,
      provider.getSigner()
    );
    const isApproved = await nftContract.isApprovedForAll(
      wallet,
      process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS
    );
    console.log("approved?", isApproved);
    if (!isApproved) {
      await (
        await nftContract.setApprovalForAll(
          process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS,
          true,
          { from: wallet }
        )
      ).wait();
    }

    if (price % 1 == 0 && price > 0) {
      try {
        // console.log(Web3.utils.toWei(`${price}`, 'ether'));

        await (
          await marketplace.createSell(
            nftContractAddress,
            tokenId,
            ethers.utils.parseEther(price),
            wallet,
            { from: wallet }
          )
        ).wait();

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
    // setIsLoading(true);
    let provider = new ethers.providers.Web3Provider(window.ethereum);

    let marketplace = new ethers.Contract(
      process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS,
      marketplaceABI,
      provider.getSigner()
    );
    let nftContractAddress = data.nft.collection.address;
    let tokenId = data.nft.tokenID;
    try {
      // console.log();
      await (
        await marketplace.buy(nftContractAddress, tokenId, wallet, {
          from: wallet,
          value: data?.nft.listNFTs[0].price,
        })
      ).wait();

      location.reload();
      console.log("purchase success");
      setStatus({ message: "Purchase successful", type: "success" });
    } catch (err) {
      console.log(err);
      setStatus({ message: err.message, type: "error" });
      setIsLoading(false);
    }
    // "0x" + Web3.utils.toBN(Web3.utils.toWei(``, "ether")).toString(16)}
  };

  const removeListing = async () => {
    setIsLoading(true);
    let provider = new ethers.providers.Web3Provider(window.ethereum);
    let marketplace = new ethers.Contract(
      process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS,
      marketplaceABI,
      provider.getSigner()
    );
    let nftContractAddress = data.nft.collection.address;
    let tokenId = data.nft.tokenID;
    let nftContract = new ethers.Contract(
      nftContractAddress,
      nftContractABI,
      provider.getSigner()
    );
    const isApproved = await nftContract.isApprovedForAll(
      wallet,
      process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS
    );
    console.log("approved?", isApproved);
    if (!isApproved) {
      await (
        await nftContract.setApprovalForAll(
          process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS,
          true,
          { from: wallet }
        )
      ).wait();
    }
    try {
      await (
        await marketplace.cancelListedNFT(nftContractAddress, tokenId, {
          from: wallet,
        })
      ).wait();

      location.reload();
      setStatus({ message: "Successfully removed listing", type: "success" });
    } catch (err) {
      setStatus({ message: err.message, type: "error" });
      setIsLoading(false);
    }
  };

  const transferToken = async () => {
    setProcessing(true);
    let provider = new ethers.providers.Web3Provider(window.ethereum);
    let nftContractAddress = data.nft.collection.address;
    let nftContract = new ethers.Contract(
      nftContractAddress,
      nftContractABI,
      provider.getSigner()
    );
    try {
      await (
        await nftContract.transferFrom(wallet, recipient, id, { from: wallet })
      ).wait();

      location.reload();
      setStatus({ message: "Transfer Successful", type: "success" });
    } catch (err) {
      setStatus({ message: err.message, type: "error" });
      setProcessing(false);
    }
  };

  const fetchMetaData = (nft) => {
    if (nft.collection.id === "0x4dcb45bf5c40b1aef707aa10633012fb9e48bd41") {
      const nftMeta = kaiKongMetadataJSON.find(
        (meta) => +meta.edition === +nft.name.split("#")[1]
      );

      setTokenRank(nftMeta.rank);

      setnftTraits([]);

      nftMeta.attributes.map((attr: any) => {
        setnftTraits((nftTraits) => [...nftTraits, attr]);
      });
    }
    const baseURI = nft.collection.baseURI;
    console.log(
      process.env.NEXT_PUBLIC_FILEBASE_IPFS_ENDPOINT +
        baseURI.split("ipfs://")[1] +
        "/_metadata_with_rarity.json"
    );
    fetch(
      process.env.NEXT_PUBLIC_FILEBASE_IPFS_ENDPOINT +
        baseURI.split("ipfs://")[1] +
        "_metadata_with_rarity.json"
    )
      .then(async (response) => {
        const metaDataJson = await response.json();
        const nftMeta = metaDataJson.find(
          (meta) => meta.name === nft.name
        );

        setTokenRank(nftMeta.rank);

        setnftTraits([]);

        nftMeta.attributes.map((attr: any) => {
          setnftTraits((nftTraits) => [...nftTraits, attr]);
        });
      })
      .catch(console.log);
  };

  function sentenceCase(str) {
    if (str === null || str === "") return false;
    else str = str.toString();

    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  useEffect(() => {
    getCurrentWallet();
    walletListener();
  }, []);

  useEffect(() => {
    if (!loading && !error && wallet) {
      if (data?.nft?.listNFTs.length) {
        if (compareAddress(wallet, data?.nft?.listNFTs[0].seller.address)) {
          setIsOwner(true);
        } else {
          setIsOwner(false);
        }
      } else {
        if (data && data.nft && compareAddress(wallet, data?.nft?.owner.address)) {
          setIsOwner(true);
        } else {
          setIsOwner(false);
        }
      }
    }
  }, [wallet, loading, error, data?.nft?.owner.address, data?.nft?.listNFTs, data]);

  useEffect(() => {
    setData(_data);
    if (_data && _data.nft) {
      fetchMetaData(_data.nft);
    }
  }, [_data]);

  useEffect(() => {
    setLoading(_loading);
  }, [_loading]);

  useEffect(() => {
    setError(_error);
  }, [_error]);

  useEffect(() => {
    if (data?.nft?.listNFTs.length) {
      setIsListed(true);
    } else {
      setIsListed(false);
    }
  }, [data?.nft?.listNFTs]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center">
        <span className="loader"></span>
      </div>
    );
  }
  if (error) {
    console.log(error);
    return null;
  }

  const nft = data.nft;
  if (!nft) return null;
  console.log(isListed, wallet, isOwner);
  return (
    <section className="text-gray-600 body-font overflow-hidden">
      <div className="container px-5 py-24 mx-auto">
        <div className="lg:w-4/5 mx-auto flex flex-wrap">
          <img
            className="lg:w-1/2 w-full h-full object-cover object-center rounded"
            src={convertIPFSPath(nft.image)}
          />
          <div className="lg:w-1/2 w-full lg:pl-10 lg:py-6 mt-6 lg:mt-0">
            <div className="flex gap-4 items-center">
              <h1 className="text-gray-900 text-3xl title-font font-medium mb-1">
                {nft.name}
              </h1>
              <span>- Rank #{tokenRank}</span>
            </div>
            <span className="text-sm">
              owned by {`${nft.owner.address}`.slice(0, 5) + ".."}
            </span>

            <p className="text-lg mt-4 text-black">
              There are 10,000 Kongs running rampant on the KardiaChain Network!
            </p>

            {isListed && nft.listNFTs.length ? (
              <div className="my-6">
                <h2 className="text-black text-2xl flex justify-center items-center gap-2 w-fit">
                  {nft.listNFTs[0].price} KAI{" "}
                  <span className="p-1 bg-gray-100 text-xs rounded-lg">
                    On Sale
                  </span>{" "}
                </h2>
              </div>
            ) : (
              <></>
            )}

            <div className="nft__controlls mt-6">
              <div className="flex gap-2">
                {!isListed ? (
                  !wallet ? (
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
                ) : (
                  <></>
                )}

                {isListed &&
                  (!wallet ? (
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
                  ))}
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

                  <div className="flex flex-wrap mt-3 gap-4">
                    {nftTraits.map((attr, index) => (
                      <div
                        key={index}
                        className="card bg-gray-200 p-4 rounded-lg"
                      >
                        <h2 className="text-blue-800">{attr.trait_type}</h2>
                        <span>{sentenceCase(attr.value)}</span>
                      </div>
                    ))}
                  </div>
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
