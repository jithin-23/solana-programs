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

import {
    clusterApiUrl,
    Connection,
    LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
    generateSigner,
    keypairIdentity,
    percentAmount,
    publicKey,
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

const collectionAddress = publicKey(
    "FRbzaPi4rGNUc1XDX6Y4Ng8oaZgG9PgX6GPMAi73Cs6D"
);

console.log("Creating an NFT...");

const mint = generateSigner(umi);

const transaction = await createNft(umi, {
    mint,
    name: "Kiran",
    uri: "https://jithin-23.github.io/nft-project/solana-spl-token/solana-nft-collection/kiran.json",
    sellerFeeBasisPoints: percentAmount(1),
    collection: {
        key: collectionAddress,
        verified: false,
    },
});

await transaction.sendAndConfirm(umi);

const createdNft = await fetchDigitalAsset(umi, mint.publicKey);

console.log(
    `🖼️ Created NFT! Address is ${getExplorerLink(
        "address",
        createdNft.mint.publicKey,
        "devnet"
    )}`
);
