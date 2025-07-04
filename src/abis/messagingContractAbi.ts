export const messagingContractAbi = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "conversationId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address[]",
				"name": "participants",
				"type": "address[]"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "ConversationCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "string",
				"name": "conversationId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "blobId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "messageType",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "MessageStored",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "conversationMessages",
		"outputs": [
			{
				"internalType": "string",
				"name": "blobId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "conversationId",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "messageType",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "suiObjectId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "txDigest",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "conversations",
		"outputs": [
			{
				"internalType": "string",
				"name": "id",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "createdAt",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "updatedAt",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "conversationId",
				"type": "string"
			}
		],
		"name": "getConversation",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "id",
						"type": "string"
					},
					{
						"internalType": "address[]",
						"name": "participants",
						"type": "address[]"
					},
					{
						"internalType": "uint256",
						"name": "createdAt",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "updatedAt",
						"type": "uint256"
					}
				],
				"internalType": "struct MessagingContract.Conversation",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "conversationId",
				"type": "string"
			}
		],
		"name": "getConversationMessageCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "conversationId",
				"type": "string"
			}
		],
		"name": "getConversationMessages",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "blobId",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "conversationId",
						"type": "string"
					},
					{
						"internalType": "address",
						"name": "sender",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "messageType",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "suiObjectId",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "txDigest",
						"type": "string"
					}
				],
				"internalType": "struct MessagingContract.MessageRecord[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getUserMessageCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getUserMessages",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "blobId",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "conversationId",
						"type": "string"
					},
					{
						"internalType": "address",
						"name": "sender",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "messageType",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "suiObjectId",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "txDigest",
						"type": "string"
					}
				],
				"internalType": "struct MessagingContract.MessageRecord[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "messageType",
				"type": "string"
			}
		],
		"name": "getUserMessagesByType",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "blobId",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "conversationId",
						"type": "string"
					},
					{
						"internalType": "address",
						"name": "sender",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "messageType",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "suiObjectId",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "txDigest",
						"type": "string"
					}
				],
				"internalType": "struct MessagingContract.MessageRecord[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "blobId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "conversationId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "messageType",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "suiObjectId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "txDigest",
				"type": "string"
			}
		],
		"name": "storeMessage",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "userMessages",
		"outputs": [
			{
				"internalType": "string",
				"name": "blobId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "conversationId",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "messageType",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "suiObjectId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "txDigest",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]