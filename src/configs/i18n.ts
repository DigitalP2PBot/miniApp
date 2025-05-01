import i18n from "i18next";
import { initReactI18next } from "react-i18next";

type TranslationResources = {
  [key: string]: {
    translation: { [key: string]: string };
  };
};

const resources: TranslationResources = {
  en: {
    translation: {
      processing: "Starting order...",
      processOrderButtonTitle: "Waiting to move funds...",
      summaryOrder: "Order Summary",
      buttonConnectWalleTitle: "Connect Wallet",
      orderId: "Order ID",
      cryptoAmount: "Crypto Amount",
      depositFund: "Deposit Fund",
      walletAddress: "Connected wallet Address",
      networkId: "Network name",
      errorApprovingTransaction:
        "You should approve the transaction to continue the trade",
      errorTransactionNotApproved: "Transaction not approved",
      errorTransactionProcessOrder: "Error moving funds",
      errorTransactionRejected: "Transaction rejected",
      transactionApproved: "Transaction approved",
      walletNotConnected: "Wallet not connected",
      tokenAddress: "Polygon address (USDT)",
      digialP2PExchangeAddress: "Digital P2P Exchange Address",
      transactionInfo:
        "Transaction Info! Go to your wallet and approve the transaction",
      transactionApprovedHelp:
        "You should approve the transaction in your wallet to move the funds",
      transactionTitle: "We require two transactions to move the funds",
      transactionToApprove: "Approval transaction to move funds.",
      transactionToMove: "Transaction to move funds.",
      reconnect: "Reconnect",
      sendFunds: "Send funds",
      goToWallet: "Go to wallet",
    },
  },
  es: {
    translation: {
      depositFund: "Depositar fondos",
      processing: "Iniciando orden...",
      processOrderButtonTitle: "Esperando para mover fondos...",
      summaryOrder: "Resumen de la orden",
      buttonConnectWalleTitle: "Conectar Wallet",
      orderId: "ID de la orden",
      cryptoAmount: "USDT a transferir",
      walletAddress: "Dirección de la billetera conectada",
      networkId: "Nombre de la red",
      errorApprovingTransaction:
        "Debes aprobar la transacción para continuar con el intercambio",
      errorTransactionNotApproved: "Transacción no aprobada",
      errorTransactionProcessOrder: "Error moviendo fondos",
      errorTransactionRejected: "Transacción rechazada",
      transactionApproved: "Transacción aprobada",
      walletNotConnected: "No se ha detectado una billetera conectada",
      tokenAddress: "Polygon token (USDT) ${tokenAddress}",
      digitalP2PExchangeAddress: "Dirección del contrato de intercambio",
      transactionInfo: "Ve a tu billetera y aprueba la transacción",
      transactionApprovedHelp:
        "Debes aprobar la transacción en tu billetera para mover los fondos",
      transactionTitle: "Completa las siguientes acciones para mover los fondos",
      transactionToApprove: "Aprueba la transacción",
      transactionToMove: "Confirma el movimiento",
      reconnect: "Reconectar",
      sendFunds: "Enviar fondos",
      goToWallet: "Ir a la wallet",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "es", // language to use
  interpolation: {
    escapeValue: false, // react already safes from XSS
  },
});

export default i18n;
