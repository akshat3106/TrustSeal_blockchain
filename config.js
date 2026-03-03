import dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

const CONFIG = {
  rpcUrl: process.env.RPC_URL,
  privateKey: process.env.PRIVATE_KEY,
  contractAddress: process.env.CONTRACT_ADDRESS,
  port: process.env.PORT || 8000
};

const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
const signer = new ethers.Wallet(CONFIG.privateKey, provider);

const ABI = [
  "function commitCustody(bytes32 commitmentHash) external"
];

const contract = new ethers.Contract(
  CONFIG.contractAddress,
  ABI,
  signer
);

export { CONFIG, provider, signer, contract };