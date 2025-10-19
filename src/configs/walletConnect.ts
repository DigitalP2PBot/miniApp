import { createAppKit } from "@reown/appkit/react";
import { polygon, polygonAmoy, sepolia } from "@reown/appkit/networks";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";

const urlParams = new URLSearchParams(window.location.search);
const networkName = urlParams.get("networkName") as string;

// Determine environment: if on GitHub Pages (production URL), use prod
const isProduction = window.location.hostname === 'digitalp2pbot.github.io';
const environment = isProduction ? "prod" : (import.meta.env.VITE_ENVIRONMENT || "dev");

console.log("Environment detected:", environment, "URL:", window.location.hostname);

// Configure networks with proper RPC URLs if needed
const networks = {
  polygon: {
    ...polygon,
    rpcUrls: {
      ...polygon.rpcUrls,
      default: {
        http: ['https://polygon-rpc.com'],
        webSocket: undefined
      }
    }
  },
  polygonAmoy: polygonAmoy,
  sepolia: sepolia,
};

// Map environment to allowed networks
const environmentNetworks = {
  dev: ["sepolia", "polygonAmoy"],
  prod: ["polygon"],
};

type NetworkKey = keyof typeof networks;

// Determine the default network based on environment
const getDefaultNetwork = (): NetworkKey => {
  // If networkName is provided and valid for the environment, use it
  if (networkName && networks[networkName as NetworkKey]) {
    const allowedNetworks = environmentNetworks[environment as keyof typeof environmentNetworks] || environmentNetworks.prod;
    if (allowedNetworks.includes(networkName)) {
      return networkName as NetworkKey;
    }
  }

  // Otherwise use environment default
  // Default to production (polygon) unless explicitly set to dev
  if (environment === "dev") {
    return (import.meta.env.VITE_DEFAULT_NETWORK as NetworkKey) || "sepolia";
  }

  // Production default (also fallback if environment not set)
  return "polygon";
};

const DEFAULT_NETWORK = getDefaultNetwork();
const defaultNetwork = networks[DEFAULT_NETWORK];

// Get all allowed networks for the environment
const getAllowedNetworks = () => {
  // For production, ONLY allow Polygon mainnet
  if (environment === "prod") {
    return [networks.polygon];
  }

  // For dev, allow testnets
  const allowedNetworkNames = environmentNetworks[environment as keyof typeof environmentNetworks] || environmentNetworks.prod;
  const networkList = allowedNetworkNames.map(name => networks[name as NetworkKey]);
  // Ensure we have at least one network
  return networkList.length > 0 ? networkList : [defaultNetwork];
};

const APP_DOMAIN = import.meta.env.VITE_APP_DOMAIN || "https://bot.digitalp2p.co";

export const createWalletConnectModal = () => {
  const projectId =
    import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || ("" as string);

  const metadata = {
    name: "DigitalP2P Exchange",
    description: "DigitalP2P Defi Protocol.",
    url: APP_DOMAIN, // origin must match your domain & subdomain
    icons: ["https://bot.digitalp2p.co/digitalP2P.svg"],
  };

  const allowedNetworks = getAllowedNetworks();

  // Create the ethers adapter
  const ethersAdapter = new EthersAdapter();

  createAppKit({
    adapters: [ethersAdapter],
    networks: allowedNetworks as [typeof defaultNetwork, ...typeof allowedNetworks],
    defaultNetwork: defaultNetwork,
    metadata,
    projectId,
    features: {
      analytics: true, // Optional - defaults to your Cloud configuration
      socials: false, // Optional - defaults to your Cloud configuration
      emailShowWallets: false,
      email: false,
      swaps: false, // Disable swaps feature
      onramp: false, // Disable onramp feature
    },
    themeMode: 'light', // Set theme mode
    themeVariables: {
      '--w3m-accent': '#5DB075', // DigitalP2P green color
      '--w3m-border-radius-master': '8px',
    }
  });
};

// Export helper to get the expected network for validation
export const getExpectedNetwork = () => DEFAULT_NETWORK;
export const getExpectedNetworkId = (): number => {
  const networkIdMap: { [key: string]: number } = {
    polygon: 137,
    polygonAmoy: 80002,
    sepolia: 11155111,
  };
  return networkIdMap[DEFAULT_NETWORK];
};

// Export the network object for switching
export const getExpectedNetworkObject = () => defaultNetwork;
