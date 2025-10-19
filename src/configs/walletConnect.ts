import { createAppKit } from "@reown/appkit/react";
import { polygon, polygonAmoy, sepolia } from "@reown/appkit/networks";

const urlParams = new URLSearchParams(window.location.search);
const networkName = urlParams.get("networkName") as string;
const environment = import.meta.env.VITE_ENVIRONMENT || "dev";

const networks = {
  polygon: polygon,
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
    const allowedNetworks = environmentNetworks[environment as keyof typeof environmentNetworks] || environmentNetworks.dev;
    if (allowedNetworks.includes(networkName)) {
      return networkName as NetworkKey;
    }
  }

  // Otherwise use environment default
  if (environment === "prod") {
    return "polygon";
  }

  // Dev environment default
  return (import.meta.env.VITE_DEFAULT_NETWORK as NetworkKey) || "sepolia";
};

const DEFAULT_NETWORK = getDefaultNetwork();
const defaultNetwork = networks[DEFAULT_NETWORK];

// Get all allowed networks for the environment
const getAllowedNetworks = () => {
  const allowedNetworkNames = environmentNetworks[environment as keyof typeof environmentNetworks] || environmentNetworks.dev;
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

  createAppKit({
    networks: allowedNetworks as [typeof defaultNetwork, ...typeof allowedNetworks],
    defaultNetwork: defaultNetwork,
    metadata,
    projectId,
    features: {
      analytics: true, // Optional - defaults to your Cloud configuration
      socials: false, // Optional - defaults to your Cloud configuration
      emailShowWallets: false,
      email: false,
    },
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
