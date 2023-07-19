const { CHAIN_ID, CHAIN_STAGE, ChainStage } = require("@layerzerolabs/lz-sdk")

function getEndpointId() {
    if (isLocalhost()) {
        return 30137
    }
    let network = hre.network.name;
    if (network === "base-testnet"){
        return 10160
    }
    else if (network === "scroll-testnet"){
        return 10170
    }
    else if (network === "zkSync-testnet"){
        return 10165
    }
    else if (network === "linea-testnet"){
        return 10157
    } else {
        return CHAIN_ID[hre.network.name]
    }
}

function isLocalhost() {
    return hre.network.name === "localhost" || hre.network.name === "hardhat"
}

function isTestnet() {
    return (
        hre.network.name === "localhost" ||
        hre.network.name === "hardhat" ||
        CHAIN_STAGE[hre.network.name] === ChainStage.TESTNET ||
        CHAIN_STAGE[hre.network.name] === ChainStage.TESTNET_SANDBOX
    )
}

module.exports = {
    getEndpointId,
    isTestnet,
    isLocalhost,
}
