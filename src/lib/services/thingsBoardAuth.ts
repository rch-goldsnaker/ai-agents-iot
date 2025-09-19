/**
 * ThingsBoard Authentication Service
 * Handles dynamic token generation using environment variables
 */

interface ThingsBoardAuthResponse {
  token: string;
  refreshToken: string;
}

interface ThingsBoardLoginRequest {
  username: string;
  password: string;
}

interface ThingsBoardConfig {
  url: string;
  username: string;
  password: string;
  defaultEntityId: string;
  entityType: string;
  accessToken?: string;
}

class ThingsBoardAuthService {
  private static instance: ThingsBoardAuthService;
  private accessToken: string | null = null;
  private tokenExpirationTime: number | null = null;
  private config: ThingsBoardConfig;

  private constructor() {
    this.config = {
      url: process.env.THINGSBOARD_URL || 'https://thingsboard.cloud',
      username: process.env.THINGSBOARD_USERNAME || '',
      password: process.env.THINGSBOARD_PASSWORD || '',
      defaultEntityId: process.env.THINGSBOARD_DEFAULT_ENTITY_ID || '',
      entityType: process.env.THINGSBOARD_ENTITY_TYPE || 'DEVICE',
      accessToken: process.env.THINGSBOARD_ACCESS_TOKEN
    };

    if (!this.config.username || !this.config.password) {
      throw new Error('ThingsBoard credentials not found in environment variables');
    }
  }

  public static getInstance(): ThingsBoardAuthService {
    if (!ThingsBoardAuthService.instance) {
      ThingsBoardAuthService.instance = new ThingsBoardAuthService();
    }
    return ThingsBoardAuthService.instance;
  }

  /**
   * Get a valid access token (refresh if needed)
   */
  public async getAccessToken(): Promise<string> {
    // Check if we have a valid token that hasn't expired
    if (this.accessToken && this.tokenExpirationTime && Date.now() < this.tokenExpirationTime) {
      console.log('🔑 ThingsBoardAuth: Using cached token');
      return this.accessToken;
    }

    // Check if there's a token in environment variables as fallback
    if (this.config.accessToken && !this.isTokenExpired(this.config.accessToken)) {
      console.log('🔑 ThingsBoardAuth: Using environment token');
      this.accessToken = this.config.accessToken;
      return this.accessToken;
    }

    // Generate new token
    console.log('🔑 ThingsBoardAuth: Generating new token');
    return await this.generateNewToken();
  }

  /**
   * Generate a new access token using login API
   */
  private async generateNewToken(): Promise<string> {
    try {
      const loginData: ThingsBoardLoginRequest = {
        username: this.config.username,
        password: this.config.password
      };

      console.log('🔑 ThingsBoardAuth: Authenticating with ThingsBoard...');
      
      const response = await fetch(`${this.config.url}/api/auth/login`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Authentication failed: ${response.status} ${response.statusText}. ${errorText}`);
      }

      const authResponse: ThingsBoardAuthResponse = await response.json();
      
      if (!authResponse.token) {
        throw new Error('No access token received from ThingsBoard');
      }

      this.accessToken = authResponse.token;
      
      // Set expiration time (JWT tokens typically last 1 hour, we'll refresh 5 minutes before)
      this.tokenExpirationTime = Date.now() + (55 * 60 * 1000); // 55 minutes
      
      console.log('✅ ThingsBoardAuth: New token generated successfully');
      return this.accessToken;

    } catch (error) {
      console.error('❌ ThingsBoardAuth: Failed to generate token:', error);
      throw new Error(`Failed to authenticate with ThingsBoard: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if a JWT token is expired (basic check)
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.warn('🔑 ThingsBoardAuth: Could not parse token, assuming expired');
      return true;
    }
  }

  /**
   * Get ThingsBoard configuration
   */
  public getConfig(): ThingsBoardConfig {
    return { ...this.config };
  }

  /**
   * Clear cached token (force refresh on next request)
   */
  public clearToken(): void {
    this.accessToken = null;
    this.tokenExpirationTime = null;
    console.log('🔑 ThingsBoardAuth: Token cache cleared');
  }
}

export default ThingsBoardAuthService;
export type { ThingsBoardConfig, ThingsBoardAuthResponse, ThingsBoardLoginRequest };