// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract PuzzleNFT is ERC721, ERC721URIStorage, ERC721Enumerable, ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _tokenIdCounter;
    
    struct PuzzleData {
        uint256 gridSize;
        string resolverHash;
        address creator;
        bool isLocked;
        uint256 completionReward;
        string contentHash;
    }
    
    // Storage
    mapping(uint256 => PuzzleData) public puzzleData;
    mapping(string => uint256) public hashToTokenId;
    mapping(address => uint256) public mintCount;
    mapping(uint256 => mapping(address => bool)) public hasCompleted;
    mapping(address => bool) public whitelist; 
    mapping(uint256 => bool) public puzzleExists; 

    // Configuration
    uint256 public constant MINT_PRICE = 0.001 ether;
    uint256 public constant MAX_PER_WALLET = 50;
    uint256 public maxSupply = 10000;
    bool public mintingEnabled = true;
    
    // Royalty settings
    uint256 public royaltyPercentage = 250; // 2.5% (in basis points)
    address public royaltyReceiver;
    
    // Events
    event PuzzleCreated(uint256 indexed tokenId, address indexed creator, uint256 gridSize);
    event PuzzleCompleted(uint256 indexed tokenId, address indexed player);
    event PuzzleLocked(uint256 indexed tokenId, bool locked);
    event RewardClaimed(uint256 indexed tokenId, address indexed player, uint256 amount);
    event BaseURIUpdated(string newBaseURI);
    event WhitelistUpdated(address indexed account, bool whitelisted);
    event RoyaltyUpdated(address indexed receiver, uint256 percentage);

    constructor() ERC721("Interactive Puzzle NFT", "PUZZLE") {
        _tokenIdCounter.increment(); // Start at token ID 1
        royaltyReceiver = msg.sender; // Set deployer as initial royalty receiver
    }

    // Mint a puzzle NFT
    function mintPuzzle(
        string memory metadataURI,
        uint256 gridSize,
        string memory resolverHash,
        string memory contentHash,
        uint256 completionReward,
        uint256 originalTokenId
    ) public payable nonReentrant {
        require(mintingEnabled, "Minting is disabled");
        require(_tokenIdCounter.current() < maxSupply, "Max supply reached");
        require(gridSize > 1 && gridSize <= 10, "Invalid grid size");
        require(!puzzleExists[originalTokenId], "Puzzle already exists for this NFT");

        if (msg.sender != owner() && !whitelist[msg.sender]) {
            require(msg.value >= MINT_PRICE, "Insufficient payment");
            require(mintCount[msg.sender] < MAX_PER_WALLET, "Exceeds max per wallet");
        }

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        puzzleData[tokenId] = PuzzleData({
            gridSize: gridSize,
            resolverHash: resolverHash,
            creator: msg.sender,
            isLocked: false,
            completionReward: completionReward,
            contentHash: contentHash
        });

        puzzleExists[originalTokenId] = true;
        mintCount[msg.sender]++; // Increment the mint count for this wallet

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);

        emit PuzzleCreated(tokenId, msg.sender, gridSize);
    }

    // Complete a puzzle
    function completePuzzle(uint256 tokenId, string memory solution) public {
        require(_exists(tokenId), "Token does not exist");
        require(!hasCompleted[tokenId][msg.sender], "Already completed");
        require(!puzzleData[tokenId].isLocked, "Puzzle is locked");
        require(
            keccak256(abi.encodePacked(solution)) == 
            keccak256(abi.encodePacked(puzzleData[tokenId].resolverHash)),
            "Invalid solution"
        );
        
        hasCompleted[tokenId][msg.sender] = true;

        if (puzzleData[tokenId].completionReward > 0) {
            uint256 reward = puzzleData[tokenId].completionReward;
            puzzleData[tokenId].completionReward = 0;
            payable(msg.sender).transfer(reward);
            emit RewardClaimed(tokenId, msg.sender, reward);
        }

        emit PuzzleCompleted(tokenId, msg.sender);
    }

    // Toggle puzzle lock
    function togglePuzzleLock(uint256 tokenId) public {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not token owner");

        puzzleData[tokenId].isLocked = !puzzleData[tokenId].isLocked;
        emit PuzzleLocked(tokenId, puzzleData[tokenId].isLocked);
    }

    // 🔹 Getter functions for frontend 🔹
    function getPuzzleDetails(uint256 tokenId) public view returns (PuzzleData memory) {
        require(_exists(tokenId), "Token does not exist");
        return puzzleData[tokenId];
    }

    function checkPuzzleCompletion(uint256 tokenId, address player) public view returns (bool) {
        return hasCompleted[tokenId][player];
    }

    function checkPuzzleExists(uint256 originalTokenId) public view returns (bool) {
        return puzzleExists[originalTokenId];
    }

    // Royalty functions
    function getRoyaltyInfo(uint256 tokenId, uint256 salePrice) external view returns (address receiver, uint256 royaltyAmount) {
        require(_exists(tokenId), "Token does not exist");
        
        uint256 amount = (salePrice * royaltyPercentage) / 10000; // Calculate royalty amount (basis points)
        return (royaltyReceiver, amount);
    }
    
    function setRoyaltyReceiver(address _receiver) external onlyOwner {
        require(_receiver != address(0), "Invalid address");
        royaltyReceiver = _receiver;
        emit RoyaltyUpdated(royaltyReceiver, royaltyPercentage);
    }
    
    function setRoyaltyPercentage(uint256 _percentage) external onlyOwner {
        require(_percentage <= 1000, "Royalty too high"); // Max 10%
        royaltyPercentage = _percentage;
        emit RoyaltyUpdated(royaltyReceiver, royaltyPercentage);
    }

    // 🔹 Admin functions 🔹
    function setMaxSupply(uint256 _maxSupply) public onlyOwner {
        maxSupply = _maxSupply;
    }
    
    function toggleMinting() public onlyOwner {
        mintingEnabled = !mintingEnabled;
    }
    
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
    }

    function setWhitelist(address account, bool whitelisted) public onlyOwner {
        whitelist[account] = whitelisted;
        emit WhitelistUpdated(account, whitelisted);
    }

    // Override totalSupply to ensure compatibility with ERC721Enumerable
    function totalSupply() public view virtual override(ERC721Enumerable) returns (uint256) {
        return _tokenIdCounter.current() - 1; // Subtract 1 because we started from 1
    }

    // 🔹 Overrides 🔹
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        // Support ERC2981 royalty standard
        if (interfaceId == 0x2a55205a) { // bytes4(keccak256("royaltyInfo(uint256,uint256)"))
            return true;
        }
        return super.supportsInterface(interfaceId);
    }
}