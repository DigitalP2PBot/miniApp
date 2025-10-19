import React, { useEffect, useState } from "react";
import {
  useAppKit,
  useAppKitAccount,
  useAppKitNetwork,
} from "@reown/appkit/react";
import { AccountControllerState } from "@reown/appkit-core";
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
    status: AccountControllerState["status"],
    address?: string,
    selectidNetworkId?: string
  ) => void;
};

const WalletConnectModal: React.FC<Props> = ({ title, onCallback }) => {
  const { open } = useAppKit();
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

  useEffect(() => {
    const setupProvider = async () => {
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
