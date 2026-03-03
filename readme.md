# TrustSeal Blockchain API

A two-step API for tamper-proof shipment custody tracking. Sensor logs are stored on IPFS with a Merkle integrity proof, then anchored immutably to the blockchain.

**Base URL:** `http://localhost:8000/api/v1`

---

## How It Works

```
Sensor Logs  ->  Merkle Tree  ->  IPFS Upload  ->  /store  ->  CID
                                                                  |
                                                                  v
                                                /anchor  ->  Blockchain Tx
```

| Step | Endpoint | What Happens |
|------|----------|--------------|
| 1 | `POST /store` | Builds Merkle tree from sensor logs, uploads snapshot to IPFS, returns CID + Merkle root |
| 2 | `POST /anchor` | Fetches snapshot from IPFS, re-verifies Merkle root, commits custody proof to blockchain |

---

## Endpoints

### 1. Store Snapshot

Uploads shipment data to IPFS and returns a CID along with the computed Merkle root.

```
POST /api/v1/store
```

#### Request Body

| Field | Type | Description |
|-------|------|-------------|
| `shipmentId` | `string` | Unique shipment identifier |
| `legNumber` | `number` | Leg number of the shipment journey |
| `receiverWallet` | `string` | Receiver's Ethereum address |
| `sensorLogs` | `array` | Array of sensor log objects (see below) |

**Sensor Log Object**

| Field | Type | Description |
|-------|------|-------------|
| `shipment_id` | `string` | Shipment reference ID |
| `temperature` | `number` | Temperature reading |
| `humidity` | `number` | Humidity reading |
| `shock` | `number` | Shock/vibration value |
| `light_exposure` | `boolean` | Whether light was detected |
| `tilt_angle` | `number` | Tilt angle in degrees |
| `recorded_at` | `number` | UNIX timestamp of the reading |

#### Example Request

```json
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
```

#### Success Response `200`

```json
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
```

#### Error Response

```json
{
  "success": false,
  "message": "Error description"
}
```

---

### 2. Anchor Settlement

Fetches the snapshot from IPFS using the CID, verifies integrity by recomputing the Merkle root, and commits the custody proof to the blockchain.

```
POST /api/v1/anchor
```

#### Request Body

| Field | Type | Description |
|-------|------|-------------|
| `cid` | `string` | IPFS CID returned from `/store` |

#### Example Request

```json
{
  "cid": "bafybeigdyrztxxxxxxxxxxxx"
}
```

#### Success Response `200`

```json
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
```

#### Error Response

```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Internal Processing

### `/store` Flow

1. Receive sensor logs in the request body
2. Build a Merkle tree from the sensor log entries
3. Compute the Merkle root hash
4. Construct a snapshot object containing shipment metadata + Merkle root
5. Upload the snapshot to IPFS
6. Return the resulting CID and Merkle root to the caller

### `/anchor` Flow

1. Fetch the snapshot from IPFS using the provided CID
2. Recompute the Merkle root from the snapshot's sensor logs
3. Verify integrity: recomputed root must match the stored root
4. Generate a commitment hash from the verified data
5. Submit a transaction to the blockchain
6. Return the transaction hash and block number

---

## Quick Start

```bash
# 1. Store sensor data on IPFS
curl -X POST http://localhost:8000/api/v1/store \
  -H "Content-Type: application/json" \
  -d '{
    "shipmentId": "SHIP-001",
    "legNumber": 1,
    "receiverWallet": "0x8ba1f109551bd432803012645ac136ddd64dba72",
    "sensorLogs": [{
      "shipment_id": "SHIP-001",
      "temperature": 5.2,
      "humidity": 48.9,
      "shock": 0.1,
      "light_exposure": false,
      "tilt_angle": 1.2,
      "recorded_at": 1772544824
    }]
  }'

# 2. Anchor the returned CID to the blockchain
curl -X POST http://localhost:8000/api/v1/anchor \
  -H "Content-Type: application/json" \
  -d '{ "cid": "bafybeigdyrztxxxxxxxxxxxx" }'
```
