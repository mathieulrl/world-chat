export class WalrusStorageService {
    constructor(config) {
        this.config = config;
    }
    /**
     * Store a message blob on Walrus network
     */
    async storeMessage(message, ownerAddress) {
        try {
            console.log(`Storing message blob for owner ${ownerAddress}`);
            // Convert message to WalrusMessage format
            const walrusMessage = {
                ...message,
                timestamp: message.timestamp.toISOString(),
            };
            // Serialize the message data
            const messageData = new TextEncoder().encode(JSON.stringify(walrusMessage));
            // Store on Walrus using PUT /v1/blobs
            const response = await fetch(`${this.config.publisherUrl}/v1/blobs`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/octet-stream',
                },
                body: messageData,
            });
            if (!response.ok) {
                throw new Error(`Failed to store blob: ${response.status} ${response.statusText}`);
            }
            const result = await response.json();
            let blobId, suiObjectId, txDigest;
            if (result.newlyCreated) {
                blobId = result.newlyCreated.blobObject?.blobId;
                suiObjectId = result.newlyCreated.blobObject?.id;
                txDigest = result.newlyCreated.event?.txDigest;
                console.log(`Blob stored successfully!`);
                console.log(`  Walrus Blob ID: ${blobId}`);
                console.log(`  Sui Blob Object ID: ${suiObjectId}`);
                if (txDigest)
                    console.log(`  Sui Transaction Digest: ${txDigest}`);
            }
            else if (result.alreadyCertified) {
                blobId = result.alreadyCertified.blobId;
                txDigest = result.alreadyCertified.event?.txDigest;
                console.log(`Blob already certified!`);
                console.log(`  Walrus Blob ID: ${blobId}`);
                if (txDigest)
                    console.log(`  Sui Transaction Digest: ${txDigest}`);
            }
            else {
                blobId = result.blobId;
                console.log(`Blob stored, but could not extract Sui object or tx digest.`);
            }
            return {
                blobId: blobId,
                size: messageData.length,
                owner: ownerAddress,
                timestamp: new Date().toISOString(),
                suiObjectId,
                txDigest,
            };
        }
        catch (error) {
            console.error('Error storing message blob:', error);
            throw error;
        }
    }
    /**
     * Retrieve a message blob from Walrus network
     */
    async retrieveMessage(blobId) {
        try {
            console.log(`Retrieving message blob with ID: ${blobId}`);
            const response = await fetch(`${this.config.aggregatorUrl}/v1/blobs/${blobId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/octet-stream',
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to retrieve blob: ${response.status} ${response.statusText}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const data = new Uint8Array(arrayBuffer);
            const jsonString = new TextDecoder().decode(data);
            const walrusMessage = JSON.parse(jsonString);
            // Convert back to Message format
            const message = {
                ...walrusMessage,
                timestamp: new Date(walrusMessage.timestamp),
            };
            console.log(`Message blob retrieved successfully, size: ${data.length} bytes`);
            return message;
        }
        catch (error) {
            console.error('Error retrieving message blob:', error);
            throw error;
        }
    }
    /**
     * Get blob metadata
     */
    async getBlobMetadata(blobId) {
        try {
            const response = await fetch(`${this.config.aggregatorUrl}/v1/blobs/${blobId}/metadata`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to get blob metadata: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('Error getting blob metadata:', error);
            throw error;
        }
    }
}
