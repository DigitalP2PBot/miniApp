import { Contract, Eip1193Provider, ethers, BrowserProvider } from "ethers";

const USDTAbi = [
  "function approve(address spender, uint256 value) returns (bool)",
];

const digitalP2PExchangeAbi = [
  "function processOrder(string _orderId, uint256 cryptoAmount, address tokenAddress)",
];

enum TransactionState {
  PENDING = "pending",
  PROCESSING = "processing",
  APPROVED = "approved",
  NOT_APPROVED = "not_approved",
  PROCCESED = "processed",
  REJECTED = "rejected",
}

export class Transaction {
  private transactionStatus: TransactionState = TransactionState.PENDING;
  private usdtContract: Promise<boolean | undefined> | boolean | undefined =
    undefined;
  private exchangeContract: Promise<boolean | undefined> | boolean | undefined =
    undefined;
  private search: string = "";
  private walletProvider: any | null = null;
  private signer: any | null = null;
  private returnMessage: string = "";

  constructor() {
    this.transactionStatus = TransactionState.PENDING;
  }

  setTransactionState = (state: TransactionState) =>
    (this.transactionStatus = state);

  checkStatus = () => {
    const isFinished = [
      TransactionState.PROCCESED,
      TransactionState.REJECTED,
      TransactionState.NOT_APPROVED,
    ].includes(this.transactionStatus);
    if (!isFinished) {
      this.createTransaction({
        search: this.search,
        walletProvider: this.walletProvider,
      });
    }
    return {
      isFinished,
      status: this.transactionStatus,
      message: this.returnMessage,
    };
  };

  public createTransaction = async ({ search, walletProvider }: any) => {
    this.search = search;
    this.walletProvider = walletProvider;
    const urlParams = new URLSearchParams(this.search);
    const signer = await this.#getSigner(this.walletProvider);
    const digitalP2PExchangeAddress = urlParams.get(
      "networkP2pContractAddress",
    ) as string;
    const cryptoAmount: number = parseFloat(
      urlParams.get("cryptoAmount") as string,
    );
    const networkTokenAddress = urlParams.get("networkTokenAddress") as string;
    const networkDecimals = parseInt(
      urlParams.get("networkDecimals") as string,
    );
    if (this.usdtContract === undefined) {
      this.usdtContract = false;
      this.#getUsdtContract({
        networkTokenAddress,
        signer,
        digitalP2PExchangeAddress,
        cryptoAmount,
        networkDecimals,
      })
        .then(() => {
          this.usdtContract = true;
        })
        .catch((e) => {
          console.error(`USDT Contract Error ${e}`);
          this.transactionStatus = TransactionState.NOT_APPROVED;
        });
    }
    const isNeedNewContract =
      this.exchangeContract === undefined && this.usdtContract === true;
    if (isNeedNewContract) {
      this.exchangeContract = false;
      const orderId: string = urlParams.get("orderId") as string;
      this.#getExchangeContract({
        digitalP2PCanMoveFunds: this.usdtContract,
        signer,
        digitalP2PExchangeAddress,
        orderId,
        cryptoAmount,
        networkDecimals,
        networkTokenAddress,
      })
        .then(() => {
          this.exchangeContract = true;
          this.returnMessage = "transactionApproved";
        })
        .catch((e) => {
          console.error(`Exchange Contract Error ${e}`);
          this.transactionStatus = TransactionState.REJECTED;
        });
    }
    return true;
  };

  #getSigner = async (walletProvider: Eip1193Provider) => {
    if (this.signer) return this.signer;
    this.setTransactionState(TransactionState.PROCESSING);
    const ethersProvider = new BrowserProvider(
      walletProvider as Eip1193Provider,
    );

    let signer = null;
    try {
      signer = await ethersProvider.getSigner();
    } catch (e) {
      console.log("error get signer", e);
      this.returnMessage = "walletNotConnected";
      this.setTransactionState(TransactionState.PENDING);
    }
    this.signer = signer;
    return signer;
  };

  #getUsdtContract = async ({
    networkTokenAddress,
    signer,
    digitalP2PExchangeAddress,
    cryptoAmount,
    networkDecimals,
  }: any) => {
    let digitalP2PCanMoveFunds = false;
    try {
      const usdtContract = new Contract(networkTokenAddress, USDTAbi, signer);

      // Send the approval transaction
      const approveTx = await usdtContract.approve(
        digitalP2PExchangeAddress,
        ethers.parseUnits(cryptoAmount.toString(), networkDecimals),
      );

      console.log("Approval transaction sent:", approveTx.hash);

      // Wait for the transaction to be mined
      const receipt = await approveTx.wait();
      console.log("Approval transaction confirmed:", receipt);

      digitalP2PCanMoveFunds = receipt.status === 1;

      if (digitalP2PCanMoveFunds) {
        this.setTransactionState(TransactionState.APPROVED);
      } else {
        throw new Error("Approval transaction failed");
      }
    } catch (e: any) {
      let errorMessage = "errorApprovingTransaction";
      if (e.reason === "rejected") errorMessage = "errorTransactionNotApproved";
      console.log("error approving transaction", e);
      this.returnMessage = errorMessage;
      this.setTransactionState(TransactionState.NOT_APPROVED);
    }
    return digitalP2PCanMoveFunds;
  };

  #getExchangeContract = async ({
    digitalP2PCanMoveFunds,
    signer,
    digitalP2PExchangeAddress,
    orderId,
    cryptoAmount,
    networkDecimals,
    networkTokenAddress,
  }: any) => {
    if (!digitalP2PCanMoveFunds) {
      this.setTransactionState(TransactionState.PENDING);
      this.returnMessage = "errorApprovingTransaction";
      return;
    }
    const digitalP2PExchangeContract = new Contract(
      digitalP2PExchangeAddress,
      digitalP2PExchangeAbi,
      signer,
    );
    try {
      // Send the processOrder transaction
      const processOrderTx = await digitalP2PExchangeContract.processOrder(
        orderId,
        ethers.parseUnits(cryptoAmount.toString(), networkDecimals),
        networkTokenAddress,
        {
          gasLimit: 300000,
        },
      );

      console.log("ProcessOrder transaction sent:", processOrderTx.hash);

      // Wait for the transaction to be mined
      const receipt = await processOrderTx.wait();
      console.log("ProcessOrder transaction confirmed:", receipt);

      if (receipt.status === 1) {
        this.setTransactionState(TransactionState.PROCCESED);
      } else {
        throw new Error("ProcessOrder transaction failed");
      }
    } catch (e: any) {
      console.log("error", e);
      let errorMessage = "errorTransactionProcessOrder";
      if (e.reason === "rejected") errorMessage = "errorTransactionRejected";
      this.returnMessage = errorMessage;
      this.setTransactionState(TransactionState.REJECTED);
    }
  };
}
