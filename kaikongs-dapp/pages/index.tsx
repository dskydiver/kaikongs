import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from 'react';
import { useQuery, gql } from "@apollo/client";
import convertIPFSPath from "../utils/convertIPFSPath";
import img1 from '../public/kk-icon.jpg';
import img2 from "../public/kc-icon.jpg";

const CollectionsQuery = gql`
  query collectionsquery {
    nftcollections {
      id
      name
    }
  }
`;

const images = [img1, img2]
export default function Home() {
  const [status, setStatus] = useState({ message: null, type: null });

  const {
    data: _data,
    loading: _loading,
    error: _error,
    fetchMore: _fetchMore,
  } = useQuery(CollectionsQuery);

  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(_loading);
  const [error, setError] = useState(_error);

  useEffect(() => {
    if (_data && _data.nftcollections) {
      setCollections(_data.nftcollections);
    }
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
    <div>
      <Head>
        <title>Kardia Kingdom</title>
        <meta name="description" content="" />
      </Head>

      <div className="App w-full min-h-screen">
        <section className="text-gray-600 body-font hero__section">
          {/* <img src="/bg.jpeg" alt="" className='absolute object-cover'/> */}
          <div className="container relative z-10 mx-auto flex items-start px-5 py-24 md:flex-row flex-col">
            <div className="lg:flex-grow md:w-[20%] lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center bg-gray-200 p-5 sm:p-10 rounded-lg">
              <h1 className="sm:text-4xl text-3xl mb-4 font-bold text-gray-900">
                Kardia Kingdom
              </h1>
              <p className="text-center sm:text-left h-fit leading-relaxed">
                {`Created by Moto - Kardia Kingdom is an Endless Realm Built on
                the KardiaChain Network. The main goal of Kardia Kingdom is to
                work to create a better world by giving back to people who need
                it the most. Kardia Kingdom as an entity is entirely Non Profit
                which means whenever there is profit - it will be put right back
                into the project for the holders/community or given out through
                various methods including airdrops, events, giveaways, and more.`}
                <br /> <br />
                {`Kardia Kingdom was created through the idea of building the
                first NFT community on the KardiaChain network. In order to
                kickstart this idea, we launched Kai Kongs - the very first
                algorithmically generated 10K PFP collection on the KardiaChain
                Network.`}
                <br /> <br />
                {`In order to build upon the idea of giving back, Kai Kongs were
                released at the mint price of 15 Kai/Kong ($0.10 at the time).
                Holding a Kai Kong is a monument to believing in our project
                since conception & we will not forget this. Kong holders will
                receive legacy airdrops/rewards for being such a strong part of
                our community & believing in our goals.`} <br /> <br />
                {`Kardia Kingdom collection holders will also receive future
                airdrops/rewards as well. The end goal of Kardia Kingdom as a
                marketplace is to allow creators/artists the ability to deploy
                their NFT art or collections onto the KardiaChain network. This
                will help the community & network to grow which are two things
                we're working very hard towards. Things are going to get very
                exciting - we have a lot planned.`}
                <br /> <br />
                {`If you're reading this - I would like to personally thank you
                for being here with us at such an early moment in the history of
                Kardia Kingdom - Moto`}
              </p>
            </div>
            <div className="lg:max-w-lg md:w-1/2 w-full"></div>
          </div>
        </section>

        {/* <div className="home_wrapper wrapper flex justify-center items-center w-full min-h-screen">

        </div> */}

        <section className="text-gray-600 body-font" id="collections">
          <div className="container px-5 py-24 mx-auto">
            <h1 className="sm:text-2xl text-3xl mb-10 font-bold text-gray-900 bg-[#f6f4f0] w-fit p-4 rounded-lg">
              Collections
            </h1>

            <div className="flex flex-wrap -m-4">
              {collections.map((collection, index) => {
                return (
                  <div key={index} className="p-4 w-full sm:w-[30%]">
                    <a href={`/collection/${collection.id}`}>
                      <div className="border-2 border-gray-200 border-opacity-60 rounded-lg">
                        <div>
                          <Image
                            className="rounded-t-lg"
                            src={images[index]}
                            width={600}
                            height={600}
                            alt="collections"
                          ></Image>
                        </div>
                        <div className="p-6 flex justify-between">
                          <h1 className="title-font text-lg text-center w-full font-medium text-gray-900">
                            <b>{collection.name}</b>
                          </h1>
                        </div>
                      </div>
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {status.message &&
          (status.type === "error" ? (
            <div
              className="p-4 fixed bottom-0 right-4 mb-4 text-sm rounded-lg bg-red-200 text-red-800"
              role="alert"
            >
              <span>{status.message}</span>
            </div>
          ) : (
            <div
              className="p-4 fixed bottom-0 right-4 mb-4 text-sm rounded-lg bg-green-200 text-green-800"
              role="alert"
            >
              <span>{status.message}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
