import { YieldSwap } from './YieldSwap';

describe('YieldSwap', () => {
  const config = {
    api: {
      baseURL: 'http://localhost:3001',
    },
    websocket: {
      url: 'ws://localhost:3001',
    },
  };

  let sdk: YieldSwap;

  beforeEach(() => {
    sdk = new YieldSwap(config);
  });

  afterEach(() => {
    sdk.disconnect();
  });

  it('should initialize SDK', () => {
    expect(sdk).toBeDefined();
    expect(sdk.getApi()).toBeDefined();
    expect(sdk.getWebSocket()).toBeDefined();
    expect(sdk.getWallet()).toBeDefined();
  });

  it('should connect and disconnect websocket', () => {
    const websocket = sdk.getWebSocket();
    const connectSpy = jest.spyOn(websocket, 'connect');
    const disconnectSpy = jest.spyOn(websocket, 'disconnect');

    sdk.connect();
    expect(connectSpy).toHaveBeenCalled();

    sdk.disconnect();
    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('should initialize with Sentry', () => {
    const sdkWithSentry = new YieldSwap({
      ...config,
      sentry: {
        dsn: 'https://test@test.ingest.sentry.io/test',
      },
    });

    expect(sdkWithSentry).toBeDefined();
  });
}); 