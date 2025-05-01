import { createAppKit } from "@reown/appkit/react";
import { polygon, polygonAmoy, sepolia } from "@reown/appkit/networks";

const urlParams = new URLSearchParams(window.location.search);
const networkName = urlParams.get("networkName") as string;

const networks = {
  polygon: polygon,
  polygonAmoy: polygonAmoy,
  sepolia: sepolia,
};
type NetworkKey = keyof typeof networks;
const DEFAULT_NETWORK = (networkName as NetworkKey) || "polygon";
const defaultNetwork = networks[DEFAULT_NETWORK];
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

  createAppKit({
    networks: [defaultNetwork],
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
