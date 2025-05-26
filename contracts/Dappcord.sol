// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Dappcord is ERC721, Ownable, ReentrancyGuard {

    uint256 public totalSupply;
    uint256 public totalChannels;

    struct Channel {
        uint256 id;
        string name;
        uint256 cost;
    }

    mapping(uint256 => Channel) public channels;
    mapping(uint256 => mapping(address => bool)) public hasJoined;
    mapping(address => uint256[]) public userChannels;

    event ChannelCreated(uint256 indexed id, string name, uint256 cost);
    event ChannelJoined(uint256 indexed id, address indexed user, uint256 tokenId);

    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {
    }

    function createChannel(string memory _name, uint256 _cost) public onlyOwner {
        require(bytes(_name).length > 0, "Channel name cannot be empty");
        require(_cost > 0, "Channel cost must be greater than 0");
        
        totalChannels++;
        channels[totalChannels] = Channel(totalChannels, _name, _cost);
        emit ChannelCreated(totalChannels, _name, _cost);
    }

    function mint(uint256 _id) public payable nonReentrant {
        require(_id != 0 && _id <= totalChannels, "Invalid channel ID");
        require(!hasJoined[_id][msg.sender], "Already joined this channel");
        require(msg.value >= channels[_id].cost, "Insufficient payment");

        // Join Channel
        hasJoined[_id][msg.sender] = true;
        userChannels[msg.sender].push(_id);

        // Mint NFT
        totalSupply++;
        _safeMint(msg.sender, totalSupply);
    }

    function getChannel(uint256 _id) public view returns(Channel memory) {
        require(_id != 0 && _id <= totalChannels, "Invalid channel ID");
        return channels[_id];
    }

    function getUserChannels(address _user) public view returns(uint256[] memory) {
        return userChannels[_user];
    }

    function withdraw() public onlyOwner nonReentrant() {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success);
    }

}
