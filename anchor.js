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

  const tree = buildMerkleTree(sensorLogs);
  const merkleRoot = tree.getHexRoot();

  const shipmentBytes = ethers.keccak256(
    ethers.toUtf8Bytes(shipmentId)
  );

  const timestamp = Math.floor(Date.now() / 1000);

  const commitment = ethers.keccak256(
    ethers.solidityPacked(
      ["bytes32","uint256","bytes32","address","uint256"],
      [
        shipmentBytes,
        legNumber,
        merkleRoot,
        receiverWallet,
        timestamp
      ]
    )
  );

  const tx = await contract.commitCustody(commitment);
  const receipt = await tx.wait();

  return {
    shipmentId,
    merkleRoot,
    commitment,
    txHash: tx.hash,
    timestamp

  };
}