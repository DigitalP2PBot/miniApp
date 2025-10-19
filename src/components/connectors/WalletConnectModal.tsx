import React, { useEffect, useState } from "react";
import {
  useAppKit,
  useAppKitAccount,
  useAppKitNetwork,
} from "@reown/appkit/react";
import {
  getExpectedNetworkId,
  getExpectedNetworkObject,
  getExpectedNetwork,
} from "../../configs/walletConnect";
import NetworkMismatchWarning from "../organism/NetworkMismatchWarning";

import ConnectButton from "../buttons/ConnectButton";
type Props = {
  title: string;
  onCallback: (
    isConnected: boolean,
    status: string | undefined,
    address?: string,
    selectidNetworkId?: string
  ) => void;
};

const WalletConnectModal: React.FC<Props> = ({ title, onCallback }) => {
  const { open, close } = useAppKit();
  const { address, isConnected, status } = useAppKitAccount();
  const { caipNetwork, switchNetwork } = useAppKitNetwork();
  const { name: selectedNetworkName, id: selectedNetworkId } = caipNetwork || {};
  const [isSwitching, setIsSwitching] = useState(false);
  const [showNetworkMismatch, setShowNetworkMismatch] = useState(false);

  console.log("caipNetwork", selectedNetworkName, selectedNetworkId);

  const connect = async () => {
    await open({ view: "Connect" });
  };

  const handleSwitchNetwork = async () => {
    setIsSwitching(true);
    try {
      const expectedNetwork = getExpectedNetworkObject();
      await switchNetwork(expectedNetwork);
      console.log(`Successfully switched to correct network`);
      setShowNetworkMismatch(false);
    } catch (error) {
      console.error("Failed to switch network:", error);
      // Open network selection modal if auto-switch fails
      await open({ view: "Networks" });
    } finally {
      setIsSwitching(false);
    }
  };

  // Add a more aggressive check for connection status
  useEffect(() => {
    let checkInterval: NodeJS.Timeout | null = null;

    // If status is not disconnected, start checking for connection
    if (status && status !== 'disconnected') {
      checkInterval = setInterval(async () => {
        console.log("Checking connection:", { isConnected, status, address });

        // If we have an address, we're connected
        if (address) {
          console.log("Wallet connected with address:", address);
          await close();
          if (checkInterval) {
            clearInterval(checkInterval);
          }
        }
      }, 500); // Check every 500ms
    }

    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [status, address, close]);

  useEffect(() => {
    const setupProvider = async () => {
      console.log("WalletConnect state:", { isConnected, status, address, selectedNetworkId });

      // Close modal if connected successfully
      if (isConnected && address) {
        console.log("Closing modal - wallet connected");
        await close();
      }

      // If connected and network doesn't match expected, show custom warning
      if (isConnected && selectedNetworkId && !isSwitching) {
        const expectedNetworkId = getExpectedNetworkId();

        if (selectedNetworkId !== expectedNetworkId) {
          console.log(
            `Network mismatch detected. Expected chain ID: ${expectedNetworkId}, Got: ${selectedNetworkId}`
          );
          // Show custom warning instead of letting WalletConnect show its error
          setShowNetworkMismatch(true);
          return; // Don't callback until network is correct
        } else {
          setShowNetworkMismatch(false);
        }
      }

      // Always callback with the current state, even if still connecting
      onCallback(isConnected, status, address, selectedNetworkName);
    };
    setupProvider();
  }, [
    selectedNetworkName,
    selectedNetworkId,
    onCallback,
    address,
    isConnected,
    status,
    isSwitching,
    close,
  ]);

  return (
    <>
      {showNetworkMismatch && (
        <NetworkMismatchWarning
          expectedNetwork={getExpectedNetwork()}
          currentNetwork={selectedNetworkName || "Unknown"}
          onSwitchNetwork={handleSwitchNetwork}
        />
      )}
      <ConnectButton title={title} callback={connect} />
    </>
  );
};

export default WalletConnectModal;
