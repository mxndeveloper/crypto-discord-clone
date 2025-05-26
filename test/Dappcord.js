const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether');
}

describe("Dappcord", function () {
  let deployer, user;
  let dappcord;
  const NAME = "Dappcord";
  const SYMBOL = "DC";
  const CHANNEL_NAME = "general";
  const CHANNEL_COST = tokens(1)

  beforeEach( async function () {  
      // Setup accounts
      [deployer, user] = await ethers.getSigners();

      // Deploy Contract
      const Dappcord = await ethers.getContractFactory("Dappcord");
      dappcord = await Dappcord.deploy(NAME, SYMBOL);
      await dappcord.deployed();

      // Create a channel
      const transaction = await dappcord.connect(deployer).createChannel(CHANNEL_NAME, CHANNEL_COST);
      await transaction.wait();
  });

  describe("Deployment", function () {
    it("Sets the name", async function () {   
      expect(await dappcord.name()).to.equal(NAME);
    });

    it("Sets the symbol", async function () {     
      expect(await dappcord.symbol()).to.equal(SYMBOL);
    });

    it("Sets the owner", async function () {
      expect(await dappcord.owner()).to.equal(deployer.address);
    });    
  })

  describe("Channels", async function () {
    it("Update channels count", async function () {
      expect(await dappcord.totalChannels()).to.equal(1);
    });

    it("Returns channel attributes", async function () {
      const channel = await dappcord.getChannel(1);
      expect(channel.name).to.equal(CHANNEL_NAME);
      expect(channel.cost).to.equal(CHANNEL_COST);
    });
  })

  describe('Joining Channels', () => {
    const ID = 1;
    const AMOUNT = ethers.utils.parseUnits("1", 'ether');

    beforeEach(async function () {
      const transaction = await dappcord.connect(user).mint(ID, {value: AMOUNT});
      await transaction.wait();
    });
    it('Joins the user', async function () {
      expect(await dappcord.hasJoined(ID, user.address)).to.be.true;
    });

    it('Tracks user channels', async function () {
      const userChannels = await dappcord.getUserChannels(user.address);
      expect(userChannels.length).to.equal(1);
      expect(userChannels[0]).to.equal(ID);
    });

    it('Increases the total supply', async function () {
      expect(await dappcord.totalSupply()).to.equal(1);
    });

    it('Updates the contract balance', async function () {
      expect(await ethers.provider.getBalance(dappcord.address)).to.equal(AMOUNT);
    });

    it('Prevents double joining', async function () {
      await expect(
        dappcord.connect(user).mint(ID, {value: AMOUNT})
      ).to.be.revertedWith("Already joined this channel");
    });
  });
});