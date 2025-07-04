# Chatterbox - Worldcoin Mini App Messaging

A modern messaging application built as a Worldcoin Mini App that allows users to send messages and money seamlessly. Messages are stored in Walrus for persistent, searchable conversation history.

## Features

### 💬 Messaging
- Real-time messaging between users
- Message history stored in Walrus for persistence
- Search functionality across conversations
- Modern, responsive UI with shadcn/ui components

### 💰 Payments
- Send WLD and USDC payments directly in conversations
- Integration with Worldcoin MiniKit for secure payments
- Payment status tracking (pending, success, failed)
- Payment history in message threads

### 👥 User Management
- Worldcoin username integration
- User profiles with avatars
- Conversation management
- Contact discovery via Worldcoin addresses

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **State Management**: React Context + React Query
- **Payments**: Worldcoin MiniKit
- **Storage**: Walrus AI for message persistence
- **Routing**: React Router

## Getting Started

### Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Create .env file
VITE_WALRUS_API_KEY=your_walrus_api_key
VITE_WALRUS_PROJECT_ID=your_walrus_project_id
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Worldcoin Integration

### MiniKit Setup

The app integrates with Worldcoin MiniKit for:
- User authentication via World App
- Secure payment processing
- Username resolution

### Payment Flow

1. **Initiate Payment**: Generate unique reference ID
2. **Send Payment**: Use MiniKit to process payment
3. **Verify Payment**: Confirm transaction status
4. **Store Message**: Save payment message to Walrus

### Supported Tokens

- **WLD**: Worldcoin's native token
- **USDC**: USD Coin stablecoin

## Walrus Integration

### Message Storage

All messages are stored in Walrus collections:
- **Collection**: `messages`
- **Metadata**: conversationId, senderId, messageType
- **Search**: Full-text search across conversations

### Message Types

- **Text Messages**: Regular chat messages
- **Payment Messages**: Payment transactions with status tracking

## Project Structure

```
src/
├── components/          # React components
│   ├── ConversationList.tsx
│   ├── ChatInterface.tsx
│   ├── MessageBubble.tsx
│   └── MessagingApp.tsx
├── contexts/           # React contexts
│   └── MessagingContext.tsx
├── services/           # Business logic
│   ├── worldcoinService.ts
│   └── walrusService.ts
├── types/              # TypeScript types
│   └── messaging.ts
└── api/               # API endpoints
    └── initiate-payment.ts
```

## API Endpoints

### Payment Endpoints

- `POST /api/initiate-payment`: Generate payment reference
- `POST /api/confirm-payment`: Verify payment status

## Development Notes

### Mock Services

For development, the app uses mock implementations of:
- **Worldcoin MiniKit**: Simulates payment processing
- **Walrus Client**: In-memory storage for testing

### Production Setup

To deploy to production:

1. Replace mock services with real implementations
2. Configure Walrus API credentials
3. Set up Worldcoin Mini App in Developer Portal
4. Configure payment whitelist addresses

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support or questions:
- Create an issue in this repository
- Check the Worldcoin documentation
- Review Walrus AI documentation
