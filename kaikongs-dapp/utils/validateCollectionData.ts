export interface CollectionDataType {
  name: string;
  symbol: string;
  royaltyFee: number;
  royaltyRecipient: string;
  maxSupply: number;
  mintPrice: number;
  baseURI: string;
}

export default function Validate (collectionData: CollectionDataType) {
  let errors = {}

  if (!collectionData.name) {
    errors['name'] = 'Name is required!'
  }

  if (!collectionData.symbol) {
    errors["symbol"] = "Symbol is required!";
  }

  if (collectionData.royaltyFee <= 0) {
    errors["royaltyFee"] = "Royalty Fee can't be less than 0"
  }

  if (collectionData.mintPrice <= 0) {
    errors["mintPrice"] = "Mint Price can't be less than 0";
  }

  if (collectionData.maxSupply <= 0) {
    errors["maxSupply"] = "Max Supply can't be less than 0";
  }

  if (!collectionData.royaltyRecipient) {
    errors["royaltyRecipient"] = "Royalty Recipient can't be empty string"
  }

  if (collectionData.baseURI) {
    if (!collectionData.baseURI.startsWith('ipfs://')) {
      errors["baseURI"] = "BaseURI should start with 'ipfs://'"
    }
  }
  else {
    errors["baseURI"] = "BaseURI can't be empty string";
  }

  if (Object.keys(errors).length) {
    return {isValidated: false, errors}
  }
  
  return {isValidated: true, errors: {}}
}