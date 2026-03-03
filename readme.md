TrustSeal Blockchain API

Base URL

http://localhost:8000/api/v1
1. Store Snapshot (IPFS Upload)

Uploads shipment data to IPFS and returns a CID along with the computed Merkle root.

Endpoint
POST /api/v1/store
Request Schema
{
  "shipmentId": "string",
  "legNumber": "number",
  "receiverWallet": "string (Ethereum address)",
  "sensorLogs": [
    {
      "shipment_id": "string",
      "temperature": "number",
      "humidity": "number",
      "shock": "number",
      "light_exposure": "boolean",
      "tilt_angle": "number",
      "recorded_at": "number (UNIX timestamp)"
    }
  ]
}
Example Request
{
  "shipmentId": "SHIP-001",
  "legNumber": 1,
  "receiverWallet": "0x8ba1f109551bd432803012645ac136ddd64dba72",
  "sensorLogs": [
    {
      "shipment_id": "SHIP-001",
      "temperature": 5.2,
      "humidity": 48.9,
      "shock": 0.1,
      "light_exposure": false,
      "tilt_angle": 1.2,
      "recorded_at": 1772544824
    }
  ]
}
Success Response
{
  "success": true,
  "data": {
    "shipmentId": "SHIP-001",
    "legNumber": 1,
    "receiverWallet": "0x8ba1f109551bd432803012645ac136ddd64dba72",
    "timestamp": 1772549999,
    "merkleRoot": "0xd72ca27e6333bde2b2cd77432726c50983483d34a456634a5323306c6ee07862",
    "cid": "bafybeigdyrztxxxxxxxxxxxx"
  }
}
Error Response
{
  "success": false,
  "message": "Error description"
}
2. Anchor Settlement (Blockchain Commit)

Fetches the snapshot from IPFS using the CID, verifies integrity by recomputing the Merkle root, and commits the custody proof to the blockchain.

Endpoint
POST /api/v1/anchor
Request Schema
{
  "cid": "string (IPFS CID)"
}
Example Request
{
  "cid": "bafybeigdyrztxxxxxxxxxxxx"
}
Success Response
{
  "success": true,
  "data": {
    "shipmentId": "SHIP-001",
    "cid": "bafybeigdyrztxxxxxxxxxxxx",
    "merkleRoot": "0xd72ca27e6333bde2b2cd77432726c50983483d34a456634a5323306c6ee07862",
    "commitment": "0xcd2dd3e8faaccdc0e46d4df4ae724b1381a9a0a0bfb7a4d638d35d23bf24a725",
    "txHash": "0x5efa0db431c239d4985db90b7c8223839d5a4f2ab410db5d1e37e5577051a373",
    "blockNumber": 12345678
  }
}
Internal Processing Overview

During /store:

Sensor logs are used to build a Merkle tree.

The Merkle root is computed.

A snapshot object is created.

The snapshot is uploaded to IPFS.

The resulting CID is returned.

During /anchor:

Snapshot is fetched from IPFS using CID.

Merkle root is recomputed from sensor logs.

Integrity is verified.

A commitment hash is generated.

A blockchain transaction is submitted.

Transaction hash and block number are returned.

