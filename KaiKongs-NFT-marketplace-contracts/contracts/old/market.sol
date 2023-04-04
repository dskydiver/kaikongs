// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract KardiaKingdom is ReentrancyGuard {
    using Counters for Counters.Counter;

    address payable owner;
    uint256 public marketplaceFees = 7.5 ether;

    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool isListed;
    }

    uint256 public itemCount;
    uint256 public itemsListed;
    uint256 public volume;

    mapping(uint256 => MarketItem) private idToMarketItem;
    uint256[] private listedTokenIds;

    event MarketItemListed(
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool isListed
    );

    constructor() {
        owner = payable(msg.sender);
    }

    function listMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    )
        public
        payable
        // uint256 royalties
        nonReentrant
    {
        require(price > 0, "Price must be at least 0.25 KAI");

        idToMarketItem[tokenId] = MarketItem(
            tokenId,
            payable(msg.sender),
            payable(address(this)),
            price,
            true
        );

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit MarketItemListed(tokenId, msg.sender, address(this), price, true);

        itemCount++;
        itemsListed++;
        listedTokenIds.push(tokenId);
    }

    function createMarketSale(
        address nftContract,
        uint256 tokenId
    ) public payable nonReentrant {
        MarketItem storage item = idToMarketItem[tokenId];

        require(item.isListed == true, "Item not listed for sale.");

        uint256 price = item.price;

        require(
            msg.value >= price,
            "Please submit the asking price in order to complete the purchase"
        );

        uint256 fees = (marketplaceFees / 100) * price;

        item.seller.transfer(msg.value - fees);

        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        item.owner = payable(msg.sender);
        item.isListed = false;
        itemsListed--;

        volume += price;

        uint256 indexToDelete = 0;
        for (uint256 i = 0; i < listedTokenIds.length; i++) {
            if (listedTokenIds[i] == tokenId) {
                indexToDelete = i;
                break;
            }
        }

        // Move the last element of the array into the position of the element to delete
        uint256 lastIndex = listedTokenIds.length - 1;
        listedTokenIds[indexToDelete] = listedTokenIds[lastIndex];

        // Delete the last element of the array (which is now a duplicate)
        listedTokenIds.pop();
    }

    function resellToken(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) public payable {
        require(
            idToMarketItem[tokenId].owner == msg.sender,
            "Only item owner can perform this operation"
        );
        require(
            idToMarketItem[tokenId].isListed == false,
            "Item already listed."
        );

        idToMarketItem[tokenId].isListed = true;
        idToMarketItem[tokenId].price = price;

        idToMarketItem[tokenId].seller = payable(msg.sender);
        idToMarketItem[tokenId].owner = payable(address(this));

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
        itemsListed++;
        listedTokenIds.push(tokenId);
    }

    function removeListing(
        uint256 tokenId,
        address nftContract
    ) public payable nonReentrant {
        MarketItem storage item = idToMarketItem[tokenId];
        require(item.isListed == true, "Item is not listed for sale.");
        require(
            item.seller == msg.sender,
            "Only item owner can perform this operation"
        );

        // Find the index of the tokenId in the listedTokenIds array
        uint256 indexToDelete = 0;
        for (uint256 i = 0; i < listedTokenIds.length; i++) {
            if (listedTokenIds[i] == tokenId) {
                indexToDelete = i;
                break;
            }
        }

        // Move the last element of the array into the position of the element to delete
        uint256 lastIndex = listedTokenIds.length - 1;
        listedTokenIds[indexToDelete] = listedTokenIds[lastIndex];

        // Delete the last element of the array (which is now a duplicate)
        listedTokenIds.pop();

        IERC721(nftContract).transferFrom(address(this), item.seller, tokenId);
        itemCount--;
        itemsListed--;
        delete idToMarketItem[tokenId];
    }

    function updatePrice(uint256 tokenId, uint256 price) public {
        MarketItem storage item = idToMarketItem[tokenId];
        require(item.isListed == true, "Item is not listed for sale.");
        require(
            msg.sender == item.seller,
            "Only item owner can perform this operation"
        );
        item.price = price;
    }

    function getPrice(uint256 tokenId) public view returns (uint256) {
        MarketItem memory item = idToMarketItem[tokenId];
        return item.price;
    }

    function isListed(uint256 tokenId) public view returns (bool) {
        MarketItem memory item = idToMarketItem[tokenId];
        return item.isListed;
    }

    function getFloorTokenId() public view returns (uint256) {
        require(itemsListed > 0, "There are no items listed for sale");

        uint256 minimumPrice = idToMarketItem[listedTokenIds[0]].price;
        uint256 minimumPriceTokenId = listedTokenIds[0];

        for (uint256 i = 1; i < itemsListed; i++) {
            uint256 currentPrice = idToMarketItem[listedTokenIds[i]].price;
            if (currentPrice < minimumPrice) {
                minimumPrice = currentPrice;
                minimumPriceTokenId = listedTokenIds[i];
            }
        }

        return minimumPriceTokenId;
    }

    function getListedTokenIds() external view returns (uint256[] memory) {
        return listedTokenIds;
    }

    function getSeller(uint256 tokenId) public view returns (address) {
        MarketItem memory item = idToMarketItem[tokenId];
        return item.seller;
    }

    function getListedNFTsByUser(
        address user
    ) public view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < listedTokenIds.length; i++) {
            uint256 tokenId = listedTokenIds[i];
            if (idToMarketItem[tokenId].seller == user) {
                count++;
            }
        }
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < listedTokenIds.length; i++) {
            uint256 tokenId = listedTokenIds[i];
            if (idToMarketItem[tokenId].seller == user) {
                result[index] = tokenId;
                index++;
            }
        }
        return result;
    }

    function withdraw() public {
        require(msg.sender == owner, "Can be executed only by the owner");
        require(address(this).balance > 0, "Balance is zero");
        payable(owner).transfer(address(this).balance);
    }

    function transferOwnership(address payable newOwner) public {
        require(msg.sender == owner, "Only the owner can transfer ownership");
        owner = newOwner;
    }
}
