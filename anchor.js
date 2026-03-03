import axios from "axios";
import { ethers } from "ethers";
import { contract } from "./config.js";
import { buildMerkleTree } from "./merkle.js";

export async function anchorShipment({
  shipmentId,
  legNumber,
  receiverWallet,
  sensorLogs
}) {

  if (!sensorLogs || sensorLogs.length === 0) {
    throw new Error("No sensor logs provided");
  }

  // ---------------- 1️⃣ Build Merkle Root ----------------
  const tree = buildMerkleTree(sensorLogs); 
  const merkleRoot = tree.getHexRoot();

  const timestamp = Math.floor(Date.now() / 1000);

  // ---------------- 2️⃣ Build Snapshot JSON ----------------
  const snapshot = {
    shipmentId,
    legNumber,
    receiverWallet,
    timestamp,
    merkleRoot,
    sensorLogs
  };

  // ---------------- 3️⃣ Upload Snapshot to IPFS (Pinata) ----------------
  const pinataResponse = await axios.post(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    snapshot,
    {
      headers: {            
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY
      }
    }
  );

  const cid = pinataResponse.data.IpfsHash;

  // ---------------- 4️⃣ Build Commitment ----------------
  const shipmentBytes = ethers.keccak256(
    ethers.toUtf8Bytes(shipmentId)
  );

  // Convert CID to fixed bytes32
  const cidBytes = ethers.keccak256(
    ethers.toUtf8Bytes(cid)
  );

  const commitment = ethers.keccak256(
    ethers.solidityPacked(
      ["bytes32","uint256","bytes32","bytes32","address","uint256"],
      [
        shipmentBytes,
        legNumber,
        merkleRoot,
        cidBytes,
        receiverWallet,
        timestamp
      ]
    )
  );

  // ---------------- 5️⃣ Anchor on Blockchain ----------------
  const tx = await contract.commitCustody(commitment);
  const receipt = await tx.wait();

  return {
    shipmentId,
    legNumber,
    receiverWallet,
    timestamp,
    merkleRoot,
    cid,
    commitment,
    txHash: tx.hash,
    blockNumber: receipt.blockNumber
  };
}