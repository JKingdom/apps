const BN = require('bn.js');
const Api = require('@polkadot/api').default;
const WsProvider = require('@polkadot/api-provider/ws').default;
const extrinsics = require('@polkadot/extrinsics').default;
const encodeExtrinsic = require('@polkadot/extrinsics/codec/encode/uncheckedLength').default;
const Keyring = require('@polkadot/util-keyring').default;
const storage = require('@polkadot/storage').default;

const Encoder = new TextEncoder();
const keyring = new Keyring();
const provider = new WsProvider('ws://192.168.1.237:8082');
const api = new Api(provider);

async function getBlockHash(height) {
  return await api.chain.getBlockHash(height);
}

async function getAccountIndex(address) {
  return api.state.getStorage([storage.system.public.accountNonce, address]);
}

async function transfer(keyRingFrom, addressTo, amount) {
  const hash = await getBlockHash(0);
  const nextAccountIndex = await getAccountIndex(keyRingFrom.address());
  // console.log(keyRingFrom, nextAccountIndex, extrinsics.staking.public.transfer)
  // encode the call for signing
  const encoded = encodeExtrinsic(keyRingFrom, nextAccountIndex, extrinsics.staking.public.transfer, [
    addressTo,
    amount,
  ], hash);

  console.log(Buffer.from(encoded).toString('hex'));
  await api.author
    .submitExtrinsic(encoded)
    .then(data => {
      console.log(data);
    })
    .catch(e => console.log(e));
}

const Alice = keyring.addFromSeed(Encoder.encode('Alice                           '));
const addressBob = '5Gw3s7q4QLkSWwknsiPtjujPv3XM4Trxi5d4PgKMMk3gfGTE';
const amount = new BN(69); // on dev chain, the fee is 1, that makes it a round 1000

console.log(`Crafting and sending an extrinsic for Alice to send Bob ${amount} DOTs`);

transfer(Alice, addressBob, amount)
  .then(() => console.log('Done'))
  .catch(error => console.log(error))
  .finally(_ => process.exit(0));

// 9e000000
// 81
// ffd172a74cda4c865912c32ba0a80a57ae69abae410e5ccb59dee84e2f4432db4f
// 96b2c4f924cb5a6b728af7480ee553e4aaf08cc667de5ae57209500752972ef597dadbd7ceb9f21b75c86c8a01a2966dfcbceb6aee23abd7f63429e006e2b608
// 0000000000000000
// 00
// 0100
// ffd7568e5f0a7eda67a82691ff379ac4bba4f9c9b859fe779b5d46363b61ad2db945000000000000000000000000000000

// 9e000000
// 81
// ffd172a74cda4c865912c32ba0a80a57ae69abae410e5ccb59dee84e2f4432db4f
// 7a770d2a8814a5e980672253c38d6f3fa3188c69ed384f59d49f15831c98a3b6ea88632de8f1426a0e05155f0ec9bb22575a5b82a184b6cf059d14357ab2fb05
// 0000000000000000
// 00
// 0100
// ffd7568e5f0a7eda67a82691ff379ac4bba4f9c9b859fe779b5d46363b61ad2db945000000000000000000000000000000
