import { useQuery, gql } from "@apollo/client";

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

export default function Collection() {
  const { data, loading, error, fetchMore } = useQuery(MyCollectionsQuery)
  const handleCreateCollection = () => {};

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
        <button
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          onClick={handleCreateCollection}
        >
          Create a Collection
        </button>
        <table className="border-collapse border border-slate-400 w-full">
          <thead>
            <tr>
              <th>Id</th>
              <th>Name</th>
              <th>Symbol</th>
              <th>MintPrice</th>
              <th>MaxSupply</th>
            </tr>
          </thead>
          <tbody>
            {data?.nftcollections?.map((collection, index) => {
              return (
                <tr key={index}>
                  <td>{collection.id}</td>
                  <td>{collection.name}</td>
                  <td>{collection.symbol}</td>
                  <td>{collection.mintPrice}</td>
                  <td>{collection.maxSupply}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
