// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IAIOracle {
    function requestAIResponse(string memory prompt) external payable returns (bytes32);
    function getAIResponse(bytes32 requestId) external view returns (string memory);
    function fee() external view returns (uint256);
}

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
}

contract SmilePlease {
    IAIOracle public aiOracle;
    IERC20 public rewardToken;
    uint256 public rewardAmount;
    address public owner;
    
    mapping(bytes32 => string) public photoRequests; // requestId => photoUrl
    mapping(string => uint8) public smileScores; // photoUrl => smileScore
    
    event SmileAnalysisRequested(bytes32 indexed requestId, string photoUrl);
    event SmileAnalysisReceived(bytes32 indexed requestId, string photoUrl, uint8 smileScore);
    
    constructor(address _aiOracleAddress, address _rewardTokenAddress, uint256 _rewardAmount) {
        aiOracle = IAIOracle(_aiOracleAddress);
        rewardToken = IERC20(_rewardTokenAddress);
        rewardAmount = _rewardAmount;
        owner = msg.sender;
    }
    
    function analyzeSmile(string memory photoUrl) external payable {
        uint256 oracleFee = aiOracle.fee();
        require(msg.value >= oracleFee, "Insufficient fee");
        
        // Construct the prompt for smile analysis
        string memory prompt = string(
            abi.encodePacked(
                "Photo URL: ", photoUrl, "\n",
                "Task: Score the smile in this photo\n",
                "Scale: 1 to 5 (1 = no smile, 5 = genuine teethy smile)\n",
                "Instructions: Respond with ONLY a single number between 1-5"
            )
        );
        
        bytes32 requestId = aiOracle.requestAIResponse{value: oracleFee}(prompt);
        photoRequests[requestId] = photoUrl;
        
        emit SmileAnalysisRequested(requestId, photoUrl);
    }
    
    function handleAIResponse(bytes32 requestId, string memory prompt, string memory response) external {
        require(msg.sender == address(aiOracle), "Only AIOracle can call this");
        
        string memory photoUrl = photoRequests[requestId];
        require(bytes(photoUrl).length > 0, "Unknown request");
        
        bytes memory responseBytes = bytes(response);
        require(responseBytes.length > 0, "Empty response");
        uint8 smileScore = uint8(responseBytes[0]) - 48; // Convert ASCII to number
        require(smileScore >= 1 && smileScore <= 5, "Invalid score");
        
        smileScores[photoUrl] = smileScore;
        delete photoRequests[requestId];
        
        if (smileScore > 3) {
            require(rewardToken.transfer(tx.origin, rewardAmount), "Token transfer failed");
        }
        
        emit SmileAnalysisReceived(requestId, photoUrl, smileScore);
    }
    
    function isGenuineSmile(string memory photoUrl) external view returns (bool) {
        return smileScores[photoUrl] >= 4;
    }
    
    function getSmileScore(string memory photoUrl) external view returns (uint8) {
        return smileScores[photoUrl];
    }
    
    function getOracleFee() external view returns (uint256) {
        return aiOracle.fee();
    }
    
    function setRewardToken(address _newRewardToken) external {
        require(msg.sender == owner, "Only owner can change reward token");
        rewardToken = IERC20(_newRewardToken);
    }
    
    function setRewardAmount(uint256 _newRewardAmount) external {
        require(msg.sender == owner, "Only owner can change reward amount");
        rewardAmount = _newRewardAmount;
    }
}
