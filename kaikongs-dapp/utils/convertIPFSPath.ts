const convertIPFSPath = (url: string) => {
  return url.replace("ipfs://", process.env.NEXT_PUBLIC_FILEBASE_IPFS_ENDPOINT);
}

export default convertIPFSPath