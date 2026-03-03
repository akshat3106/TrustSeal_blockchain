import { ethers } from "ethers";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

export function buildMerkleTree(sensorLogs) {

  const leaves = sensorLogs.map(log => {

    const shipmentBytes = ethers.keccak256(
      ethers.toUtf8Bytes(log.shipment_id)
    );

    return keccak256(
      ethers.solidityPacked(
        ["bytes32","uint256","uint256","uint256","bool","uint256","uint256"],
        [
          shipmentBytes,
          Math.round(log.temperature * 100),
          Math.round(log.humidity * 100),
          Math.round(log.shock * 100),
          log.light_exposure,
          Math.round(log.tilt_angle * 100),
          log.recorded_at
        ]
      )
    );
  });

  return new MerkleTree(leaves, keccak256, { sortPairs: true });
}