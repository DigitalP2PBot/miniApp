import { useState, useEffect } from "react";

import { AppDispatch, RootState } from "./redux/store";
import { useDispatch, useSelector } from "react-redux";
import { setConnectionState } from "./redux/connectionSlice";

import WebApp from "@twa-dev/sdk";
import { AccountControllerState } from "@reown/appkit-core";

import { Transaction } from './workers/transactionWorker';
import {
  useDisconnect,
  useAppKitProvider,
  useAppKit,
} from "@reown/appkit/react";

import PrimaryButton from "./components/buttons/PrimaryButton";
import LoadingButton from "./components/buttons/LoadingButton";
import GhostButton from "./components/buttons/GhostButton";
import WalletConnectModal from "./components/connectors/WalletConnectModal";
import LayoutHeader from "./components/organism/LayuotHeader";
import InfoLabel from "./components/organism/InfoLabel";
import InfoCard from "./components/organism/InfoCard";
import StatusLabel from "./components/organism/StatusLabel";
import StatusOverlay from "./components/statusOverlay/StatusOverlay";

import i18n from "./configs/i18n";
import i18next from "i18next";

enum View {
  LANDING = 0,
  CONNECT = 1,
  CONNECTED = 2,
  WALLET = 3,
}

enum walletConnectionState {
  DISCONNECTED = "disconnected",
  CONNECTED = "connected",
}

enum TransactionState {
  PENDING = "pending",
  PROCESSING = "processing",
  APPROVED = "approved",
  NOT_APPROVED = "not_approved",
  PROCCESED = "processed",
  REJECTED = "rejected",
}

const env = import.meta.env.VITE_ENVIRONMENT;
const telegramCloseAppTimeOut = 2000;
const DEBUG_LEVEL = import.meta.env.VITE_DEBUG_LEVEL || "error";

WebApp.setHeaderColor("#1a1a1a");
function App() {
  const { close } = useAppKit();
  const { walletProvider } = useAppKitProvider("eip155");
  const { disconnect } = useDisconnect();
  const [view, setView] = useState<View>(View.CONNECT);
  const [userWalletAddress, setWalletAddress] = useState<string | undefined>(
    ""
  );
  const [logMesasgeError, setLogMessageError] = useState<string>("");
  const [logMesasgeSuccess, setLogMessageSuccess] = useState<string>("");
  const [connectionStatus, setConnectionStatus] =
    useState<AccountControllerState["status"]>();
  const [messageLog, setMessageLog] = useState<string>("");
  const [transactionState, setTransactionState] = useState<TransactionState>(
    TransactionState.PENDING
  );
  const [networkName, setNetwotkName] = useState<string | undefined>("");

  const telegramWebApp = window.Telegram.WebApp;

  const urlParams = new URLSearchParams(window.location.search);
  const orderId: string = urlParams.get("orderId") as string;
  const cryptoAmount: number = parseFloat(
    urlParams.get("cryptoAmount") as string
  );
  const lang = urlParams.get("lang") as string;

  const transaction = new Transaction();
  let checkInterval: any | null = null;

  i18n.changeLanguage(lang ?? "es");
  const connectionState = useSelector(
    (state: RootState) => state.connection.connectionState
  );

  const dispatch = useDispatch<AppDispatch>();

  const finishTransaction = (message:string, state: TransactionState) => {
    clearInterval(checkInterval);
    checkInterval = null;
    setTimeout(() => {
      telegramWebApp.close();
    }, telegramCloseAppTimeOut);
    if(state === TransactionState.PROCCESED){
      setLogMessageSuccess(i18n.t(message));
      return;
    }
    setLogMessageError(i18n.t(message));
  }

  const approveTransaction = async () => {
    setTransactionState(TransactionState.PROCESSING);

    transaction.createTransaction({search: window.location.search, walletProvider});
    checkInterval = setInterval(() => {
      const {isFinished, status, message} = transaction.checkStatus();
      if (isFinished) {
        finishTransaction(message, status);
      }
      setTransactionState(status);
    }, 500);

  };
  const disconnectUser = async () => {
    await disconnect();
    await close();
  };

  const getAccountData = () => {
    //const providerId = window.localStorage.getItem("providerId");
  };

  const handleConnect = (
    isConnected: boolean,
    status: AccountControllerState["status"],
    address?: string,
    selectedNetworkName?: string
  ) => {
    if (isConnected) {
      dispatch(setConnectionState(walletConnectionState.CONNECTED));
      setView(View.CONNECTED);
    } else {
      dispatch(setConnectionState(walletConnectionState.DISCONNECTED));
      setView(View.CONNECT);
    }
    setWalletAddress(address);
    setConnectionStatus(status);
    setNetwotkName(selectedNetworkName);
  };

  // Handle MainButton changes on view change
  useEffect(() => {
    if (view === View.LANDING) {
    }
    // Change the Main Buttons color and textColor to match telegrams background color, to "hide" the button
    if (view === View.CONNECT) {
    }
    if (view === View.CONNECTED) {
      getAccountData();
    }
    if (view === View.WALLET) {
    }
  }, [view]);

  useEffect(() => {
    console.log("disconnect user", connectionState);
    //console.log("connectionState", connectionState);
    if (connectionState === walletConnectionState.CONNECTED) {
      setView(View.CONNECTED);
    } else if (connectionState === walletConnectionState.DISCONNECTED) {
      setView(View.CONNECT);
    }
  }, [connectionState, walletConnectionState]);

  // Test Functions
  //const [signedMessage, setSignedMessage] = useState<string | null>(null);

  // Disconnect
  const handleDisconnect = async () => {
    await disconnectUser();
    dispatch(setConnectionState(walletConnectionState.DISCONNECTED));
  };

 const { open } = useAppKit();

  const handleReconnect = async () => {
    await handleDisconnect();
    handleConnect(false, "disconnected");
    open({ view: "Connect" });
  };

  useEffect(() => {
    // Access the WebApp object

    // Log the values
    const logMessage = `location search ${window.location.search} app data ${telegramWebApp.initData}`;
    setMessageLog(logMessage);
  }, []);
  return (
    <div className="bg-azureishWhite min-h-screen">
      <LayoutHeader />
      <main className="flex flex-col h-80v w-screen rounded-xl">
        <div className="flex flex-col flex-grow min-h-full justify-end">
          <div className="components-container">
            <div className="flex flex-col bg-white pt-4 pr-8 pb-8 pl-8 gap-4 rounded-t-3xl shadow-custom-white">
              {env === "dev" && DEBUG_LEVEL === "debug" && (
                <p className="text-customGrayText mt-0 mr-0 mb-4 ml-0 text-left">
                  Message log {messageLog}
                </p>
              )}
              {logMesasgeError && (
                <>
                  <div
                    className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 font-medium"
                    role="alert"
                  >
                    {logMesasgeError}
                  </div>
                </>
              )}
              {logMesasgeSuccess && (
                <>
                  <div
                    className="p-4 mb-4 text-sm text-oceanGreen rounded-lg bg-azureishWhite dark:bg-gray-800 dark:text-green-400 font-medium"
                    role="alert"
                  >
                    {logMesasgeSuccess}
                  </div>
                </>
              )}
              {transactionState === TransactionState.PROCESSING && (
                <div className="p-4 mb-4 text-sm text-oceanGreen rounded-lg bg-azureishWhite dark:bg-dimGray dark:text-orangePeel">
                  <span className="font-medium">
                    {i18n.t("transactionInfo")}
                  </span>{" "}
                </div>
              )}

              {transactionState === TransactionState.APPROVED && (
                <div className="p-4 mb-4 text-sm text-oceanGreen rounded-lg bg-azureishWhite dark:bg-dimGray dark:text-orangePeel">
                  <span className="font-medium">
                    {i18n.t("transactionApprovedHelp")}
                  </span>{" "}
                </div>
              )}
              <div>
                {connectionStatus === walletConnectionState.CONNECTED && (
                  <>
                    <InfoLabel
                      label={i18n.t("networkId")}
                      content={networkName}
                    />

                    <InfoLabel
                      label={i18n.t("walletAddress")}
                      content={userWalletAddress}
                    />
                  </>
                )}
                <h3 className="text-xl">{i18n.t("summaryOrder")}:</h3>

                <InfoLabel
                  label={i18n.t("orderId")}
                  content={orderId}
                ></InfoLabel>

                <InfoLabel
                  label={i18n.t("cryptoAmount")}
                  content={String(cryptoAmount)}
                ></InfoLabel>

                {connectionStatus === walletConnectionState.CONNECTED && (
                  <InfoCard
                    content={
                      <>
                        <h5 className="mt-0 mr-0 mb-4 ml-0 text-left">
                          {i18n.t("transactionTitle")}:
                        </h5>
                        <StatusLabel
                          content={i18n.t("transactionToApprove")}
                          type={
                            transactionState == TransactionState.APPROVED ||
                            transactionState == TransactionState.PROCCESED ||
                            transactionState == TransactionState.REJECTED
                              ? "success"
                              : transactionState == TransactionState.PROCESSING
                                ? "pending"
                                : transactionState ==
                                    TransactionState.NOT_APPROVED
                                  ? "error"
                                  : "info"
                          }
                        />
                        <StatusLabel
                          content={i18n.t("transactionToMove")}
                          type={
                            transactionState == TransactionState.PROCCESED
                              ? "success"
                              : transactionState == TransactionState.APPROVED
                                ? "pending"
                                : transactionState == TransactionState.REJECTED
                                  ? "error"
                                  : "info"
                          }
                        />
                      </>
                    }
                  />
                )}
              </div>
              <footer className="flex flex-col gap-4 p-8 pt-0">
                {view === View.CONNECTED && (
                  <>
                    {transactionState === TransactionState.PENDING && (
                      <PrimaryButton
                        title={i18n.t("depositFund")}
                        callback={approveTransaction}
                      />
                    )}
                    {transactionState === TransactionState.PROCESSING && (
                      <LoadingButton
                        title={i18next.t("processing")}
                        isLoading={true}
                      />
                    )}
                    {transactionState === TransactionState.APPROVED && (
                      <LoadingButton
                        title={i18next.t("processOrderButtonTitle")}
                        isLoading={true}
                      />
                    )}
                    <GhostButton
                      title={i18next.t("reconnect")}
                      callback={handleReconnect}
                    />
                  </>
                )}

                {view === View.CONNECT && (
                  <WalletConnectModal
                    title={i18n.t("buttonConnectWalleTitle")}
                    onCallback={handleConnect}
                  />
                )}
              </footer>
            </div>
          </div>
        </div>
        <StatusOverlay status={transactionState}/>
      </main>
    </div>
  );
}
export default App;
