const compareAddress = (address1: string, address2: string) => {
  return address1.toLowerCase() === address2.toLocaleLowerCase()
}

export default compareAddress;