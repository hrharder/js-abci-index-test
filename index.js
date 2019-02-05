const abciServer = require("abci");
const tendermint = require("tendermint-node");

// set tendermint home directory (and abci port)
const homeDir = `${process.cwd()}/tendermint`;
const abciPort = 26658;

// genesis app state object
const state = {
    counter: 0,
    lastBlockAppHash: Buffer.from(""),
    lastBlockHeight: 0,
};

// setup abci server
const server = abciServer({
    info: infoWrapper(state),
    initChain: initChainWrapper(state),
    checkTx: checkTxWrapper(state),
    beginBlock: beginBlockWrapper(state),
    deliverTx: deliverTxWrapper(state),
    endBlock: endBlockWrapper(state),
    commit: commitWrapper(state),
});

// initialize tendermint data
tendermint.initSync(homeDir);

// start tendermint, pipe logs to stdout
const node = tendermint.node(homeDir, {
    home: "./tendermint",
    rpc: {
        laddr: 'tcp://localhost:26657'
    }
});
// node.stdout.pipe(process.stdout);

// start abci server
server.listen(abciPort, "localhost");

// begin handlers
function infoWrapper(state) {
    return (r) => {
        return {
            data: "JS-ABCI Test",
            lastBlockAppHash: state.lastBlockAppHash,
            lastBlockHeight: state.lastBlockHeight
        };
    }
}

function initChainWrapper(state) {
    return (r) => {
        console.log("Chain initialized.");
        return {};
    }
}

function checkTxWrapper(state) {
    return (r) => {
        console.log(`Received TX (mempool):\n\tType:\t${typeof r}\n\tData:\t${JSON.stringify(r)}`);
        return { code: 0 };
    }
}

function beginBlockWrapper(state) {
    return (r) => {
        const currHeight = Number(r.header.height);
        return {};
    }
}

// key piece - pay attention to tags.
function deliverTxWrapper(state) {
    return (r) => {
        console.log(`Received TX (app):\n\tType:\t${typeof r}\n\tData:\t${JSON.stringify(r)}`);
        state.counter += 1;
        return {
            code: 0,
            tags: [
                {
                    key: Buffer.from("index"),
                    value: Buffer.from(state.counter.toString())
                }
            ],
        };
    }
}

function endBlockWrapper(state) {
    return (r) => {
        return {};
    }
}

function commitWrapper(state) {
    return (r) => {
        state.lastBlockHeight +=1;
        console.log(`\nCurrent State:\n${JSON.stringify(state)}\n`);
        return {
            data: Buffer.from(JSON.stringify(state))
        };
    }
}
// end handlers