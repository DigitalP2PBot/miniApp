import React, { useEffect } from "react";
import {
  useAppKit,
  useAppKitAccount,
  useAppKitNetwork,
} from "@reown/appkit/react";
import { AccountControllerState } from "@reown/appkit-core";

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
  //const { address, isConnected, caipAddress, status } = useAppKitAccount();
  const { caipNetwork } = useAppKitNetwork();
  const { name: selectedNetworkName } = caipNetwork || {}; 
  console.log("caipNetwork", selectedNetworkName);
  const connect = async () => {
    await open({ view: "Connect" });
  };
  useEffect(() => {
    const setupProvider = () => {
      onCallback(isConnected, status, address, selectedNetworkName);
    };
    setupProvider();
  }, [selectedNetworkName, onCallback, address, isConnected, status]);
  return (
    <>
      <ConnectButton title={title} callback={connect} />
    </>
  );
};

export default WalletConnectModal;
