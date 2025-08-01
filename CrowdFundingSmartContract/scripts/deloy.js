const hre = require("hardhat");

async function main() {
    const campaignFactory = await hre.ethers.getContractFactory("CampaignFactory");
    const campaignFactoryContract = await campaignFactory.deploy();
    await campaignFactoryContract.deployed();
    console.log("CampaignFactory deployed to:", campaignFactoryContract.address);
}

main().then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});