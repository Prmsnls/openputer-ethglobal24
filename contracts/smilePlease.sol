// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IAIOracle {
    function requestAIResponse(string memory prompt) external payable returns (bytes32);
    function getAIResponse(bytes32 requestId) external view returns (string memory);
    function fee() external view returns (uint256);
}

contract SmilePlease {
    IAIOracle public aiOracle;
    
    mapping(bytes32 => string) public photoRequests; // requestId => photoUrl
    mapping(string => uint8) public smileScores; // photoUrl => smileScore
    
    event SmileAnalysisRequested(bytes32 indexed requestId, string photoUrl);
    event SmileAnalysisReceived(bytes32 indexed requestId, string photoUrl, uint8 smileScore);
    
    constructor(address _aiOracleAddress) {
        aiOracle = IAIOracle(_aiOracleAddress);
    }
    
    function analyzeSmile(string memory photoUrl) external payable {
        uint256 oracleFee = aiOracle.fee();
        require(msg.value >= oracleFee, "Insufficient fee");
        
        // Construct the prompt for smile analysis
        string memory prompt = string(
            abi.encodePacked(
                "Analyze the smile in this photo: ", 
                photoUrl, 
                ". Rate the smile intensity from 1 to 5, where 1 is no smile and 5 is a big genuine smile. ",
                "Respond with ONLY a single number between 1-5."
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
        
        // Convert the response string to a number (assuming response is "1" to "5")
        uint8 smileScore = uint8(bytes(response)[0] - 48); // Convert ASCII to number
        require(smileScore >= 1 && smileScore <= 5, "Invalid score");
        
        smileScores[photoUrl] = smileScore;
        
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
}
