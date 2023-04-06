import { useMemo, useState, useEffect } from 'react';
import { useQuery, gql } from "@apollo/client";
import { useRouter } from "next/router";
import Image from "next/image";
import { ethers } from 'ethers'
import convertIPFSPath from '../../utils/convertIPFSPath';
import Pagination from '../../components/Pagination';
import contractABI from '../../utils/contract-abi.json'

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
    }
  }
`;

export default function Collection() {
  const pageSize = useMemo(() => {
    return 20;
  }, [])
  const router = useRouter();
  const { id } = router.query;

  const [currentPage, setCurrentPage] = useState(1);

  const { data: _data, loading: _loading, error: _error, fetchMore } = useQuery(CollectionNFTQuery, {
    variables: {
      collection: id,
      offset: 0,
      pageSize
    }
  })

  const [loading, setLoading] = useState(_loading);
  const [error, setError] = useState(_error);
  const [data, setData] = useState(_data);
  const [totalSupply, setTotalSupply] = useState(0)

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

  useEffect(() => {
    if (id) {
      let provider = new ethers.providers.Web3Provider(window.ethereum);
      const nftContract = new ethers.Contract(id.toString(), contractABI, provider)
      console.log(nftContract)
      nftContract.totalSupply()
      .then((supply) => setTotalSupply(parseFloat(ethers.utils.formatEther(supply)) * Math.pow(10,18)))
      .catch(console.log)
    }
  }, [id]) 

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
    console.log(error);
    return null;
  }

  return (
    <section className="text-gray-600 body-font overflow-hidden">
      <div className="container px-5 py-24 mx-auto">
        <div className="lg:w-4/5 mx-auto flex flex-wrap">
          <div className="w-full grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8 mt-5">
            {data.nfts.map((nft, index) => (
              <div
                key={index}
                className="group relative bg-gray-100 rounded-lg"
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
    </section>
  );
}
