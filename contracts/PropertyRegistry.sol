// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PropertyRegistry {
    struct PropertyMeta {
        string slug;
        string title;
        string city;
        uint8 status; // 0=live,1=coming-soon,2=sold-out
        uint256 available;
        uint256 total;
        string blueprint;
        string render;
        string tokenized;
        int32 latE6; // latitude * 1e6
        int32 lngE6; // longitude * 1e6
        uint16 apyBps; // 987 = 9.87%
        uint64 tokenPriceUsdCents; // 108 = $1.08
    }

    address public immutable owner;
    PropertyMeta[] private properties;

    event PropertyUpsert(string slug, uint256 index);
    event PropertiesReplaced(uint256 count);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function listProperties() external view returns (PropertyMeta[] memory) {
        return properties;
    }

    function setProperties(PropertyMeta[] calldata next) external onlyOwner {
        delete properties;
        for (uint256 i = 0; i < next.length; i++) {
            properties.push(next[i]);
            emit PropertyUpsert(next[i].slug, i);
        }
        emit PropertiesReplaced(next.length);
    }

    function upsert(PropertyMeta calldata meta, uint256 index) external onlyOwner {
        if (index < properties.length) {
            properties[index] = meta;
            emit PropertyUpsert(meta.slug, index);
            return;
        }
        properties.push(meta);
        emit PropertyUpsert(meta.slug, properties.length - 1);
    }

    event PropertySold(string slug, uint256 quantity, address buyer);

    function invest(string calldata slug, uint256 quantity) external payable {
        // Find property
        uint256 index = properties.length;
        for(uint256 i=0; i<properties.length; i++) {
             // Simple string comparison by hash
             if(keccak256(bytes(properties[i].slug)) == keccak256(bytes(slug))) {
                 index = i;
                 break;
             }
        }
        require(index < properties.length, "Property not found");
        
        PropertyMeta storage p = properties[index];
        require(p.available >= quantity, "Not enough tokens available");

        // Hardcoded Price for Demo: 0.001 ETH per token
        uint256 cost = quantity * 0.001 ether;
        require(msg.value >= cost, "Insufficient funds sent");

        // Update state
        p.available -= quantity;
        
        emit PropertySold(slug, quantity, msg.sender);
    }
}
