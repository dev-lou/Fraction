
require("@nomicfoundation/hardhat-ethers");

let PRIVATE_KEY = "17cfff8361d34913c1aa032f5212dbb6a38848545d57c61c3d7747a824df76c2";
if (PRIVATE_KEY && !PRIVATE_KEY.startsWith("0x")) {
    PRIVATE_KEY = "0x" + PRIVATE_KEY;
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.20",
    networks: {
        custom_sepolia: {
            type: "http",
            url: "https://1rpc.io/sepolia",
            chainId: 11155111,
            accounts: [PRIVATE_KEY],
        },
    },
};
