# js-abci-index-test
Attempting to isolate a bug with Tendermint's JavaScript ABCI server.

## Comment
1. This was motivated by the realization that if a `ResponseDeliverTx` contained the following:

    ```json
    {
        "code": 0,
        "tags": [{
            "key": "orderId",
            "value": "somelonghexstring"
        }]
    }
    ```
    Searching the tx by hash via ABCI (`/tx?hash=""`) returned tags like:

    ```json
    {
        "code": 0,
        "tags": [{
            "key": "orderI",
            "value": "somelonghexstrin1=="
        }]
    }
    ```
    (last character of key cut off, apparent base64 artifacts.)

1. After some playing around with tag formats, I've determined:
  - Tagging through `js-abci` works, if `key`s and `value`s are `Buffer` objects
  - To query (search by tag), you must search with base64 encoded strings

1. Other notes/observations:
  - It's weird to me you can't use the `HASH` included in the ABCI's response to `broadcast_tx_sync` directly as the argument for `/tx?hash`. It must first be buffered and encoded as base64
  - Searching tx by hash over HTTP GET never worked, I had to use JSONRPC/POST
  - It's also strange that you must `/tx_query` with base64 encode parameters, the examples at https://tendermint.com/rpc/ show human-readable utf8.