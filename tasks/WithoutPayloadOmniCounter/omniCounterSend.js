const { getDeploymentAddresses } = require("../../utils/readStatic")
const { CHAIN_KEY, CHAIN_LIST_ID, CHAIN_ID, CHAINLINK_ORACLE_CLIENTS, getEndpointIdByName } = require("@layerzerolabs/lz-sdk")
const { getEndpointId } = require("../../utils/network")

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

//NOTE
// npx hardhat omniCounterSend --network celo-testnet  --target-network fuji

// increment a OmniCounter
task("omniCounterSend", "calls OmniCounter.incrementCounter()")
    .addParam("sourceNetwork", "the source network name. ie: celo-testnet")
    .addParam("targetNetwork", "the destination network name. ie: fuji-sandbox")
    .addOptionalParam("n", "the number of incrementCounter() calls. default: 1", 1, types.int)
    .addOptionalParam("delay", "milliseconds of delay between calls. default: 1000", 1000, types.int)
    .setAction(async (taskArgs, hre) => {

    const network = await hre.ethers.provider.getNetwork();
    console.log(`[HARDHAT] Connected to network with chainId ${network.chainId}`);

    const omniCounterTarget = await hre.ethers.getContract("OmniCounter")

    const endpoint = await hre.ethers.getContract("Endpoint")

    // // get the destination information
    const targetNetworkAddrs = getDeploymentAddresses(taskArgs.targetNetwork)

    const targetUaAddr = targetNetworkAddrs["OmniCounter"]


    // // get the source information
    const sourceNetworkAddrs = getDeploymentAddresses(taskArgs.sourceNetwork)
    const sourceUaAddr = sourceNetworkAddrs["OmniCounter"]


    const targetEndpointId = getEndpointIdByName(taskArgs.targetNetwork)
    console.log(`sendOmniCounter [${getEndpointId()}] -> [${targetEndpointId}] @ dst UA: ${targetUaAddr}`)


    let beforeTargetCounter = await omniCounterTarget.getCounter()
    console.log(`Counter on Target Address ${beforeTargetCounter}`)


    let adapterParams = ethers.utils.solidityPack(["uint16", "uint"], [1, 200000])
    let estimatedFees = await endpoint.estimateFees(
        targetEndpointId,
        omniCounterTarget.address,
        "0x", // message payload
        false, // payInZro
        adapterParams // _adapterParams
    )
    let fee = ethers.BigNumber.from(estimatedFees[0])
    console.log(`estimatedFees (ETH): ${ethers.utils.formatEther(fee)}`)

    let types = ["address", "address"];
    let values = [targetUaAddr, sourceUaAddr]
    let packedData = ethers.utils.solidityPack(types, values);
    console.log(`TagetUAAddr = ${values[0]}`)
    console.log(`SourceUAAddr = ${values[1]}`)
    console.log(`packedData = ${packedData}`)

    
    // send incrementCounter() call in on the source, targeting the destination OmniCounter
    let tx
    for (let i = 0; i < parseInt(taskArgs.n); ++i) {
        tx = await (
            await omniCounterTarget.incrementCounter(
                targetEndpointId,
                packedData,
                { value: fee }
            )
        ).wait()
        console.log(`[${i}] tx.hash: ${tx.transactionHash}`)

        await sleep(parseInt(taskArgs.delay))
    }


    })
