# ThingsBoard Configuration

This project now uses dynamic authentication and environment variables instead of hardcoded values for ThingsBoard integration.

## Environment Variables Setup

Create or update your `.env.local` file with the following variables:

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# ThingsBoard Cloud Configuration
THINGSBOARD_URL=https://thingsboard.cloud
THINGSBOARD_USERNAME=your_email@domain.com
THINGSBOARD_PASSWORD=your_password

# Default Device Configuration
THINGSBOARD_DEFAULT_ENTITY_ID=your_device_entity_id
THINGSBOARD_ENTITY_TYPE=DEVICE

# Authentication (optional - will be generated dynamically)
THINGSBOARD_ACCESS_TOKEN=
```

## How It Works

### Dynamic Authentication
- The system automatically generates access tokens using your username/password
- Tokens are cached and refreshed automatically when they expire
- No need to manually update hardcoded tokens

### Environment-Based Configuration
- All sensitive credentials are stored in environment variables
- Device IDs and URLs are configurable per environment
- Secure and scalable for different deployment environments

## Tools Updated

The following tools now use the new authentication system:

1. **temperatureTool.ts** - Temperature sensor data retrieval
2. **ledControlTool.ts** - LED control functionality  
3. **sensorAttributesTool.ts** - Device attributes retrieval

## Authentication Service Features

### Automatic Token Management
- Generates new tokens when needed
- Caches tokens to avoid unnecessary API calls
- Handles token expiration automatically
- Falls back to environment token if available

### Error Handling
- Comprehensive error messages for authentication failures
- Graceful handling of network issues
- Clear logging for debugging

### Security Benefits
- No hardcoded credentials in source code
- Environment-specific configuration
- Automatic token refresh
- Secure token caching

## Usage

After setting up your environment variables, the tools will automatically:

1. Read configuration from environment variables
2. Generate access tokens using the login endpoint
3. Cache tokens for optimal performance
4. Handle token renewal transparently

No changes are needed in your existing code - the tools work exactly the same way but now use secure, dynamic authentication.

## Troubleshooting

### Authentication Issues
- Verify your username and password in `.env.local`
- Check that the ThingsBoard URL is correct
- Ensure your account has the necessary permissions

### Token Issues  
- Tokens are automatically refreshed - no manual intervention needed
- Check console logs for authentication status
- Clear token cache by restarting the application if needed

### Configuration Issues
- Ensure all required environment variables are set
- Verify the default entity ID is correct for your device
- Check that the entity type matches your ThingsBoard setup