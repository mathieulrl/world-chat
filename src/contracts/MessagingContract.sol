// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MessagingContract
 * @dev Smart contract for storing Walrus blob references on-chain
 * This contract stores metadata about messages stored in Walrus
 */
contract MessagingContract {
    
    struct MessageRecord {
        string blobId;           // Walrus blob ID
        string conversationId;    // Conversation identifier
        address sender;          // Message sender address
        string messageType;      // 'text', 'payment', 'payment_request'
        uint256 timestamp;       // Block timestamp
        string suiObjectId;      // Sui object ID (optional)
        string txDigest;         // Sui transaction digest (optional)
    }
    
    struct Conversation {
        string id;
        address[] participants;
        uint256 createdAt;
        uint256 updatedAt;
    }
    
    // Mapping from user address to their message records
    mapping(address => MessageRecord[]) public userMessages;
    
    // Mapping from conversation ID to message records
    mapping(string => MessageRecord[]) public conversationMessages;
    
    // Mapping from conversation ID to conversation details
    mapping(string => Conversation) public conversations;
    
    // Events
    event MessageStored(
        address indexed sender,
        string indexed conversationId,
        string blobId,
        string messageType,
        uint256 timestamp
    );
    
    event ConversationCreated(
        string indexed conversationId,
        address[] participants,
        uint256 timestamp
    );
    
    /**
     * @dev Store a message record on-chain
     * @param blobId The Walrus blob ID
     * @param conversationId The conversation ID
     * @param messageType The type of message
     * @param suiObjectId Optional Sui object ID
     * @param txDigest Optional Sui transaction digest
     */
    function storeMessage(
        string memory blobId,
        string memory conversationId,
        string memory messageType,
        string memory suiObjectId,
        string memory txDigest
    ) public {
        MessageRecord memory record = MessageRecord({
            blobId: blobId,
            conversationId: conversationId,
            sender: msg.sender,
            messageType: messageType,
            timestamp: block.timestamp,
            suiObjectId: suiObjectId,
            txDigest: txDigest
        });
        
        // Store in user's message history
        userMessages[msg.sender].push(record);
        
        // Store in conversation's message history
        conversationMessages[conversationId].push(record);
        
        // Update conversation timestamp
        if (conversations[conversationId].createdAt == 0) {
            // Create new conversation if it doesn't exist
            address[] memory participants = new address[](1);
            participants[0] = msg.sender;
            conversations[conversationId] = Conversation({
                id: conversationId,
                participants: participants,
                createdAt: block.timestamp,
                updatedAt: block.timestamp
            });
        } else {
            // Update existing conversation
            conversations[conversationId].updatedAt = block.timestamp;
        }
        
        emit MessageStored(
            msg.sender,
            conversationId,
            blobId,
            messageType,
            block.timestamp
        );
    }
    
    /**
     * @dev Get all message records for a user
     * @param user The user address
     * @return Array of message records
     */
    function getUserMessages(address user) public view returns (MessageRecord[] memory) {
        return userMessages[user];
    }
    
    /**
     * @dev Get all message records for a conversation
     * @param conversationId The conversation ID
     * @return Array of message records
     */
    function getConversationMessages(string memory conversationId) public view returns (MessageRecord[] memory) {
        return conversationMessages[conversationId];
    }
    
    /**
     * @dev Get conversation details
     * @param conversationId The conversation ID
     * @return Conversation details
     */
    function getConversation(string memory conversationId) public view returns (Conversation memory) {
        return conversations[conversationId];
    }
    
    /**
     * @dev Get message count for a user
     * @param user The user address
     * @return Number of messages
     */
    function getUserMessageCount(address user) public view returns (uint256) {
        return userMessages[user].length;
    }
    
    /**
     * @dev Get message count for a conversation
     * @param conversationId The conversation ID
     * @return Number of messages
     */
    function getConversationMessageCount(string memory conversationId) public view returns (uint256) {
        return conversationMessages[conversationId].length;
    }
    
    /**
     * @dev Search messages by type for a user
     * @param user The user address
     * @param messageType The message type to search for
     * @return Array of matching message records
     */
    function getUserMessagesByType(address user, string memory messageType) public view returns (MessageRecord[] memory) {
        MessageRecord[] memory allMessages = userMessages[user];
        MessageRecord[] memory matchingMessages = new MessageRecord[](allMessages.length);
        uint256 matchCount = 0;
        
        for (uint256 i = 0; i < allMessages.length; i++) {
            if (keccak256(bytes(allMessages[i].messageType)) == keccak256(bytes(messageType))) {
                matchingMessages[matchCount] = allMessages[i];
                matchCount++;
            }
        }
        
        // Resize array to actual match count
        assembly {
            mstore(matchingMessages, matchCount)
        }
        
        return matchingMessages;
    }
} 