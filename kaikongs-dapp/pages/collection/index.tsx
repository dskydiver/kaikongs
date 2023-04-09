import { useState, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";
import { Button, Modal, Label, TextInput } from "flowbite-react";
import factoryABI from "../../utils/factory-abi.json";
import { ethers } from "ethers";
import Validate, {
  CollectionDataType,
} from "../../utils/validateCollectionData";

declare var window: any;

const MyCollectionsQuery = gql`
  query MyCollecitonsQuery($address: String) {
    nftcollections(where: { creator_: { address: $address } }) {
      symbol
      name
      mintPrice
      maxSupply
      id
      royaltyFee
      royaltyRecipient {
        address
      }
    }
  }
`;

export default function Collections() {
  const [isOpen, setIsOpen] = useState(false);
  const [wallet, setWallet] = useState("");
  const [collectionData, setCollectionData] = useState<CollectionDataType>({
    name: "",
    symbol: "",
    maxSupply: 0,
    mintPrice: 0,
    baseURI: "",
    royaltyFee: 0,
    royaltyRecipient: "",
  });

  const {
    data: _data,
    loading: _loading,
    error: _error,
    fetchMore: _fetchMore,
  } = useQuery(MyCollectionsQuery, {
    variables: {
      address: wallet.toLocaleLowerCase(),
    },
  });

  const [data, setData] = useState(_data);
  const [loading, setLoading] = useState(_loading);
  const [error, setError] = useState(_error);

  const handleCreateCollection = async () => {
    setIsOpen(false);
    let provider = new ethers.providers.Web3Provider(window.ethereum);
    let factory = new ethers.Contract(
      process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS,
      factoryABI,
      provider.getSigner()
    );

    let { isValidated, errors } = Validate(collectionData);
    if (isValidated) {
      let {
        name,
        symbol,
        maxSupply,
        mintPrice,
        royaltyFee,
        royaltyRecipient,
        baseURI,
      } = collectionData;
      try {
        console.log(royaltyFee);
        console.log(ethers.utils.parseEther(royaltyFee.toString()));
        await (
          await factory.createCollection(
            name,
            symbol,
            royaltyFee.toString(),
            royaltyRecipient,
            mintPrice.toString(),
            maxSupply,
            baseURI,
            {
              from: wallet,
            }
          )
        ).wait();
        location.reload()
      } catch (err) {
        console.log(err);
      }
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      console.log('connect')
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
      console.log(window.ethereum)
      await window.ethereum.request({
        method: "eth_accounts",
      });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      console.log(provider)
      let wallet = "";
      try {
        wallet = await provider.getSigner().getAddress();
        console.log(wallet);
        setWallet(wallet);
      } catch (err) {
        console.log(err)
      }
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

  const handleValueChange = (name: string) => (e) => {
    setCollectionData({
      ...collectionData,
      [name]: e.target.value,
    });
  };

  useEffect(() => {
    getCurrentWallet();
    walletListener();
  }, []);

  useEffect(() => {
    _fetchMore({
      variables: {
        address: wallet.toLowerCase(),
      },
    })
      .then(({ data, loading, error }) => {
        setData(data);
        setLoading(loading);
        setError(error);
      })
      .catch((err) => console.log(err));
  }, [_fetchMore, wallet]);

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
  return (
    <div className="w-full min-h-screen holdings__wrapper">
      <div className="top__bar cover__pg w-full text-center bg-gray-200 py-2 min-h-[20rem]"></div>
      <div className="mx-auto max-w-2xl px-4 pt-5 sm:px-6 lg:max-w-7xl lg:px-8">
        <p className="text-4xl mb-5">My Collections</p>
        {wallet ? (
          !isOpen ? (
            <Button className="mb-5" onClick={() => setIsOpen(true)}>
              Create a Collection
            </Button>
          ) : (
            <></>
          )
        ) : (
          <button
            onClick={connectWallet}
            className="flex mb-5 justify-center gap-x-4 items-center bg-[#44912d] text-white hover:bg-[sky-700] font-bold py-2 px-4 rounded-lg inline-flex"
          >
            {" "}
            Connect <img
              src="/metamask.png"
              width="30"
              alt="metamask icon"
            />{" "}
          </button>
        )}

        {isOpen ? (
          <div>
            <p>Create a Collection</p>
            <div>
              <div className="py-6 space-y-6">
                <div className="mb-6">
                  <label
                    htmlFor="default-input"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="default-input"
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={collectionData.name}
                    onChange={handleValueChange("name")}
                  />
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="default-input"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Symbol
                  </label>
                  <input
                    type="text"
                    id="default-input"
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={collectionData.symbol}
                    onChange={handleValueChange("symbol")}
                  />
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="default-input"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Max Supply
                  </label>
                  <input
                    type="number"
                    id="default-input"
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={collectionData.maxSupply}
                    onChange={handleValueChange("maxSupply")}
                  />
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="default-input"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Mint Price (KAI)
                  </label>
                  <input
                    type="number"
                    id="default-input"
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={collectionData.mintPrice}
                    onChange={handleValueChange("mintPrice")}
                  />
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="default-input"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    BaseURI
                  </label>
                  <input
                    type="text"
                    id="default-input"
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="ipfs://"
                    value={collectionData.baseURI}
                    onChange={handleValueChange("baseURI")}
                  />
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="default-input"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Royalty Fee (KAI)
                  </label>
                  <input
                    type="number"
                    id="default-input"
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={collectionData.royaltyFee}
                    onChange={handleValueChange("royaltyFee")}
                  />
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="default-input"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Royalty Recipient
                  </label>
                  <input
                    type="text"
                    id="default-input"
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={collectionData.royaltyRecipient}
                    onChange={handleValueChange("royaltyRecipient")}
                  />
                </div>
              </div>
            </div>
            <div className="flex space-x-2 mb-5">
              <Button onClick={handleCreateCollection}>Create</Button>
              <Button color="gray" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <></>
        )}
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Id
              </th>
              <th scope="col" className="px-6 py-3">
                Name
              </th>
              <th scope="col" className="px-6 py-3">
                Symbol
              </th>
              <th scope="col" className="px-6 py-3">
                MintPrice
              </th>
              <th scope="col" className="px-6 py-3">
                MaxSupply
              </th>
            </tr>
          </thead>
          <tbody>
            {data?.nftcollections?.map((collection, index) => {
              return (
                <tr
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                  key={index}
                >
                  <td
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    <a href={`/collection/${collection.id}`}>{collection.id}</a>
                  </td>
                  <td className="px-6 py-4">{collection.name}</td>
                  <td className="px-6 py-4">{collection.symbol}</td>
                  <td className="px-6 py-4">{collection.mintPrice}</td>
                  <td className="px-6 py-4">{collection.maxSupply}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
