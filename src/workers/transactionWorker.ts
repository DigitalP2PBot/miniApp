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
  private transactionStatus:TransactionState = TransactionState.PENDING;
  private usdtContract: Promise<boolean | undefined> | boolean | undefined = undefined;
  private exchangeContract: Promise <boolean | undefined> | boolean | undefined = undefined;
  private search: string = "";
  private walletProvider: any | null = null;
  private signer: any | null = null;
  private returnMessage: string = "";
  private waitForContract: any | null = undefined;
  private hasFocus: boolean = true;

  constructor() {
    this.transactionStatus = TransactionState.PENDING;
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      debugger;
      console.log('The tab has become visible');
      this.hasFocus = true;
    } else {
      console.log('The tab has become hidden');
      this.hasFocus = false;
    }
  }

  setTransactionState = (state:TransactionState) => this.transactionStatus = state;

  getTransactionState = () => this.transactionStatus;

  checkStatus = () => {
    const isFinished = [TransactionState.PROCCESED, TransactionState.REJECTED, TransactionState.NOT_APPROVED].includes(this.transactionStatus)
    console.log("status:", this.transactionStatus);
    if(!isFinished){
      this.createTransaction({search: this.search, walletProvider:this.walletProvider});
    }
    return {isFinished, status: this.transactionStatus, message: this.returnMessage};
  }

  public createTransaction = async ({search, walletProvider}: any) => {
    this.search = search;
    this.walletProvider = walletProvider;
    const isFocused = this.hasFocus;
    console.log("isFocused", isFocused);
    const urlParams = new URLSearchParams(this.search);
    const signer = await this.#getSigner(this.walletProvider);
    const digitalP2PExchangeAddress = urlParams.get(
      "networkP2pContractAddress"
    ) as string;
    const cryptoAmount: number = parseFloat(
      urlParams.get("cryptoAmount") as string
    );
    const networkTokenAddress = urlParams.get("networkTokenAddress") as string;
    const networkDecimals = parseInt(urlParams.get("networkDecimals") as string);
    if(this.usdtContract === undefined) {
      this.usdtContract = false;
      this.#getUsdtContract({
        networkTokenAddress,
        signer,
        digitalP2PExchangeAddress,
        cryptoAmount,
        networkDecimals,
      }).then(() => this.usdtContract = true)
      .catch( e => {
        console.error(`USDT Contract Error ${e}`);
        this.transactionStatus = TransactionState.NOT_APPROVED;
      });
    };
    const isNeedNewContract = this.exchangeContract === undefined && this.waitForContract === undefined && this.usdtContract === true && isFocused;
    console.log("isNeedNewContract", isNeedNewContract);
    console.table({exchangeContract: this.exchangeContract, waitForContract: this.waitForContract, usdtContract: this.usdtContract, isFocused});
    if(isNeedNewContract) {
      this.waitForContract = setTimeout(() => {
        console.log("Exchange Contract created");
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
        }).then(() => this.exchangeContract = true).catch( (e) => {
          console.error(`Exchange Contract Error ${e}`);
          this.transactionStatus = TransactionState.REJECTED;
        });
      }, 10000);
    }
    if (this.exchangeContract === true) this.returnMessage = "transactionApproved";
    return true;
  };

  #getSigner = async (walletProvider: Eip1193Provider) => {
    if (this.signer) return this.signer;
    this.setTransactionState(TransactionState.PROCESSING);
    const ethersProvider = new BrowserProvider(
      walletProvider as Eip1193Provider
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
  
  #getUsdtContract = async({
    networkTokenAddress,
    signer,
    digitalP2PExchangeAddress,
    cryptoAmount,
    networkDecimals
  }: any) => {
    let digitalP2PCanMoveFunds = false;
    try {
      const usdtContract = new Contract(networkTokenAddress, USDTAbi, signer);
      digitalP2PCanMoveFunds = await usdtContract
      .approve(
        digitalP2PExchangeAddress,
        ethers.parseUnits(cryptoAmount.toString(), networkDecimals)
      )
      .then((res) => {
        console.log("transaction approved", res);
        return res;
      });
      this.setTransactionState(TransactionState.APPROVED);
    } catch (e: any) {
      let errorMessage = "errorApprovingTransaction";
      if (e.reason === "rejected") errorMessage = "errorTransactionNotApproved";
      console.log("error approving transaction", e);
      this.returnMessage = errorMessage;
      this.setTransactionState(TransactionState.NOT_APPROVED);
    }
    return digitalP2PCanMoveFunds;
  }
  
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
      signer
    );
    try {
      await digitalP2PExchangeContract
        .processOrder(
          orderId,
          ethers.parseUnits(cryptoAmount.toString(), networkDecimals),
          networkTokenAddress,
          {
            gasLimit: 200000,
          }
        )
        .then((res) => {
          console.log("transaction processed", res);
        });
      this.setTransactionState(TransactionState.PROCCESED);
    } catch (e: any) {
      console.log("error", e);
      let errorMessage = "errorTransactionProcessOrder";
      if (e.reason === "rejected") errorMessage = "errorTransactionRejected";
      this.returnMessage = errorMessage;
      this.setTransactionState(TransactionState.REJECTED);
    }
  };
};
