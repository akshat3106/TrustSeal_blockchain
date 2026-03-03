import axios from "axios";
import { ethers } from "ethers";
import { contract } from "./config.js";
import { buildMerkleTree } from "./merkle.js";


export async function Snapshot({
  shipmentId,
  legNumber,
  receiverWallet,
  sensorLogs
}) {

  if (!sensorLogs || sensorLogs.length === 0) {
    throw new Error("No sensor logs provided");
  }

  const tree = buildMerkleTree(sensorLogs);
  const merkleRoot = tree.getHexRoot();
  const timestamp = Math.floor(Date.now() / 1000);

  const snapshot = {
    shipmentId,
    legNumber,
    receiverWallet,
    timestamp,
    merkleRoot,
    sensorLogs
  };

  const pinataResponse = await axios.post(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    snapshot,
    {
      headers: {
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
        "Content-Type": "application/json"
      }
    }
  );

  const cid = pinataResponse.data.IpfsHash;

  return {
    shipmentId,
    legNumber,
    receiverWallet,
    timestamp,
    merkleRoot,
    cid
  };
}

export async function Blockchain({ cid }) {

  // Fetch snapshot from IPFS
  const response = await axios.get(
    `https://gateway.pinata.cloud/ipfs/${cid}`
  );

  const snapshot = response.data;

  const {
    shipmentId,
    legNumber,
    receiverWallet,
    timestamp,
    merkleRoot,
    sensorLogs
  } = snapshot;


  const tree = buildMerkleTree(sensorLogs);
  const recomputedRoot = tree.getHexRoot();

  if (recomputedRoot !== merkleRoot) {
    throw new Error("Merkle root mismatch. Snapshot tampered.");
  }


  const shipmentBytes = ethers.keccak256(
    ethers.toUtf8Bytes(shipmentId)
  );

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

  const tx = await contract.commitCustody(commitment);
  const receipt = await tx.wait();

  return {
    shipmentId,
    cid,
    merkleRoot,
    commitment,
    txHash: tx.hash,
    blockNumber: receipt.blockNumber
  };
}