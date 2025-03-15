// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

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
    
    // Configuration
    uint256 public constant MINT_PRICE = 0.001 ether;
    uint256 public constant MAX_PER_WALLET = 25;
    uint256 public maxSupply = 10000;
    bool public mintingEnabled = true;
    
    // Events
    event PuzzleCreated(uint256 indexed tokenId, address indexed creator, uint256 gridSize);
    event PuzzleCompleted(uint256 indexed tokenId, address indexed player, string resolverHash);
    event PuzzleLocked(uint256 indexed tokenId, bool locked);
    event RewardClaimed(uint256 indexed tokenId, address indexed player, uint256 amount);
    event BaseURIUpdated(string newBaseURI);
    
    string private _baseURIextended;

    constructor() ERC721("Interactive Puzzle NFT", "PUZZLE") {
        _baseURIextended = "";
    }

    function mintPuzzle(
        string memory metadataURI,
        uint256 gridSize,
        string memory resolverHash,
        string memory contentHash,
        uint256 completionReward
    ) public payable nonReentrant {
        require(mintingEnabled, "Minting is disabled");
        require(msg.value >= MINT_PRICE, "Insufficient payment");
        require(mintCount[msg.sender] < MAX_PER_WALLET, "Exceeds max per wallet");
        require(_tokenIdCounter.current() < maxSupply, "Max supply reached");
        require(gridSize > 1 && gridSize <= 10, "Invalid grid size");
        
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
        
        hashToTokenId[resolverHash] = tokenId;
        mintCount[msg.sender]++;
        
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        emit PuzzleCreated(tokenId, msg.sender, gridSize);
    }

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
        
        emit PuzzleCompleted(tokenId, msg.sender, solution);
    }

    function togglePuzzleLock(uint256 tokenId) public {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        
        puzzleData[tokenId].isLocked = !puzzleData[tokenId].isLocked;
        emit PuzzleLocked(tokenId, puzzleData[tokenId].isLocked);
    }

    // Admin functions
    function setBaseURI(string memory baseURI) public onlyOwner {
        _baseURIextended = baseURI;
        emit BaseURIUpdated(baseURI);
    }
    
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

    // Override required functions
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
        return super.supportsInterface(interfaceId);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseURIextended;
    }
}