import { useMemo, useState, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";
import { useRouter } from "next/router";
import Image from "next/image";
import { ethers } from "ethers";
import convertIPFSPath from "../../utils/convertIPFSPath";
import Pagination from "../../components/Pagination";
import contractABI from "../../utils/contract-abi.json";
import img1 from "../../public/kk-icon.jpg";
import img2 from "../../public/kc-icon.jpg";

declare var window: any;

const CollectionNFTQuery = gql`
  query CollectionNFTQuery($collection: ID, $offset: Int, $pageSize: Int) {
    nfts(
      where: { collection: $collection }
      orderBy: tokenID
      skip: $offset
      first: $pageSize
    ) {
      id
      compiler
      date
      description
      dna
      edition
      image
      name
      tokenID
      tokenURI
      owner {
        address
      }
      collection {
        maxSupply
        name
        id
        address
        baseURI
        symbol
      }
    }
  }
`;

const MetricQuery = gql`
  query metricquery($collection: ID, $offset: Int, $pageSize: Int) {
    listNFTs(
      where: { nft_: { collection: $collection } canceled: false sold: false }
      first: $pageSize
      skip: $offset
      orderBy: price
    ) {
      id
      price
      nft {
        id
      }
    }
  }
`;

const images = {'KK': img1, 'KC': img2}
var currentIterator = 0;
var _volume = 0,
  _floorTokenId = "",
  _floorPrice = 0,
  _listedAmount = 0;
export default function Collection() {
  const pageSize = useMemo(() => {
    return 20;
  }, []);
  const router = useRouter();
  const { id } = router.query;

  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: _data,
    loading: _loading,
    error: _error,
    fetchMore,
  } = useQuery(CollectionNFTQuery, {
    variables: {
      collection: id,
      offset: 0,
      pageSize,
    },
  });

  const {
    data: __data,
    loading: __loading,
    error: __error,
    fetchMore: __fetchMore,
  } = useQuery(MetricQuery, {
    variables: {
      collection: id,
      offset: 0,
      pageSize: 100,
    },
  });

  const [loading, setLoading] = useState(_loading);
  const [error, setError] = useState(_error);
  const [data, setData] = useState(_data);
  const [totalSupply, setTotalSupply] = useState(0);
  const [volume, setVolume] = useState(0);
  const [listedAmount, setListedAmount] = useState(0);
  const [floorPrice, setFloorPrice] = useState(0);
  const [floorTokenId, setFloorTokenId] = useState("");

  const handlePageChange = async (page) => {
    console.log(page);
    const { data, loading, error } = await fetchMore({
      variables: {
        offset: (page - 1) * pageSize,
      },
    });
    setData(data);
    setLoading(loading);
    setError(error);
    setCurrentPage(page);
  };

  const handleMetric = async () => {
    const { data, loading, error } = await __fetchMore({
      variables: {
        collection: id,
        offset: currentIterator * 100,
        pageSize: 100,
      },
    });
    console.log(data, loading, error);

    if (data && data.listNFTs && data.listNFTs.length) {
      if (currentIterator === 0) {
        _floorPrice = data.listNFTs[0].price;
        _floorTokenId = data.listNFTs[0].nft.id;
      }

      _listedAmount += data.listNFTs.length;

      for (let i = 0; i < data.listNFTs.length; i++) {
        _volume += parseFloat(data.listNFTs[i].price);
      }

      if (data.listNFTs.length === 100) {
        currentIterator++;
        await handleMetric();
      } else {
        return;
      }
    }
  };

  useEffect(() => {
    if (id) {
      let provider = new ethers.providers.Web3Provider(window.ethereum);
      const nftContract = new ethers.Contract(
        id.toString(),
        contractABI,
        provider
      );
      console.log(nftContract);
      nftContract
        .totalSupply()
        .then((supply) =>
          setTotalSupply(
            parseFloat(ethers.utils.formatEther(supply)) * Math.pow(10, 18)
          )
        )
        .catch(console.log);
      currentIterator = 0;
      _volume = 0;
      _floorTokenId = "";
      _floorPrice = 0;
      _listedAmount = 0;
      handleMetric()
        .then(() => {
          console.log("Resolved", _volume);
          setFloorPrice(_floorPrice);
          setFloorTokenId(_floorTokenId);
          setListedAmount(_listedAmount);
          setVolume(_volume);
        })
        .catch(console.log);
    }
  }, [id]);

  useEffect(() => {
    setData(_data);
  }, [_data]);

  useEffect(() => {
    setLoading(_loading);
  }, [_loading]);

  useEffect(() => {
    setError(_error);
  }, [_error]);

  console.log(totalSupply);
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

  console.log(data?.nfts);
  return (
    <div className="w-full min-h-screen holdings__wrapper">
      <div
        className={`top__bar ${
          data && data.nfts && data.nfts.length
            ? data.nfts[0].collection.symbol
            : "cover__pg"
        } w-full text-center bg-gray-200 py-2 min-h-[20rem]`}
      ></div>
      <div className="mx-auto mb-[5rem] max-w-2xl py-16 px-4 sm:py-16 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="profile__card relative bottom-[12rem]">
          <div className="flex flex-wrap gap-4 items-end">
            <Image
              className="rounded-lg "
              src={
                data && data.nfts && data.nfts.length
                  ? images[data.nfts[0].collection.symbol]
                  : img2
              }
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
                <span>
                  {listedAmount} {}
                </span>{" "}
                <br></br>
                <span className="text-sm text-gray-600">Listed</span>
              </div>

              <div className="bg-gray-100 w-full sm:w-fit p-4 rounded-lg">
                <span>10,000</span> <br></br>
                <span className="text-sm text-gray-600">Total Kongs</span>
              </div>

              <div className="bg-gray-100 w-full sm:w-fit p-4 rounded-lg">
                <a href={`/nft/${floorTokenId}`}>{floorPrice} KAI</a> <br />
                <span className="text-sm text-gray-600">Floor Price</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-[-10rem] container mx-auto">
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {data.nfts.map((nft, index) => (
            <div key={index} className="group relative bg-gray-100 rounded-lg">
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
          ))}
        </div>
        <Pagination
          items={totalSupply}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
