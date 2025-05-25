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

  beforeEach( async function () {  
      // Setup accounts
      [deployer, user] = await ethers.getSigners();

      // Deploy Contract
      const Dappcord = await ethers.getContractFactory("Dappcord");
      dappcord = await Dappcord.deploy(NAME, SYMBOL)
  });

  describe("Deployment", function () {
    it("Sets the name", async () => {   
      // Fetch name
      let result = await dappcord.name()
      // Check name
      expect(result).to.equal(NAME)
    })

    it("Sets the symbol", async () => {     
      // Fetch symbol
      let result = await dappcord.symbol()
      // Check symbol
      expect(result).to.equal(SYMBOL)
    })

    it("Sets the owner", async () => {
      const result = await dappcord.owner()
      expect(result).to.equal(deployer.address)
    })
     
  })
})
