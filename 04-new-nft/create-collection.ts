import {
    createNft,
    fetchDigitalAsset,
    mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";

import {
    airdropIfRequired,
    getExplorerLink,
    getKeypairFromFile,
} from "@solana-developers/helpers";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
    generateSigner,
    keypairIdentity,
    percentAmount,
} from "@metaplex-foundation/umi";

const connection = new Connection(clusterApiUrl("devnet"));

const user = await getKeypairFromFile(
    "jitgabCEJMy37dfkGpY1fRPCiovsvNiUivKTiqwpazn.json"
);

await airdropIfRequired(
    connection,
    user.publicKey,
    1 * LAMPORTS_PER_SOL,
    0.5 * LAMPORTS_PER_SOL
);

console.log("Loaded user", user.publicKey.toBase58());

const umi = createUmi(connection.rpcEndpoint);

umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("Set up Umi instance for user");

const collectionMint = generateSigner(umi);

// console.log("UMI: ", umi)

console.log("collectionMint: ", collectionMint)

const transaction = await createNft(umi, {
    name: "Tokens By Jithin",
    mint: collectionMint,
    uri: "https://jithin-23.github.io/nft-project/solana-spl-token/solana-nft-collection/collection-metadata.json",
    symbol: "JToks",
    sellerFeeBasisPoints: percentAmount(0),
    isCollection: true,
});

await transaction.sendAndConfirm(umi);

console.log("Transaction Confirm");

// wait for finalization
await new Promise((resolve) => setTimeout(resolve, 3000));

const createdCollectionNft = await fetchDigitalAsset(
    umi,
    collectionMint.publicKey,
);

console.log("createdCollectionNft: ", createdCollectionNft)


console.log(
    `Created Collection 📦! Address is ${getExplorerLink(
        "address",
        createdCollectionNft.mint.publicKey,
        "devnet"
    )}`
);
