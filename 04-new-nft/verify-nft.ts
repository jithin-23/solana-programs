import {
    findMetadataPda,
    mplTokenMetadata,
    verifyCollectionV1,
  } from "@metaplex-foundation/mpl-token-metadata";
  
  import {
    airdropIfRequired,
    getExplorerLink,
    getKeypairFromFile,
  } from "@solana-developers/helpers";
  
  import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
  
  import { Connection, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
  import { keypairIdentity, publicKey } from "@metaplex-foundation/umi";
  
  const connection = new Connection(clusterApiUrl("devnet"));
  
  const user = await getKeypairFromFile();
  
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
  
  // We could also dp
  const collectionAddress = publicKey(
    "FRbzaPi4rGNUc1XDX6Y4Ng8oaZgG9PgX6GPMAi73Cs6D"
  );
  
  const nftAddress = publicKey("9fYFGJgSFYE4fie7bLyNHxqxQUgJGsSsuCK3eAwSLjNU");
  
  const transaction = await verifyCollectionV1(umi, {
    metadata: findMetadataPda(umi, { mint: nftAddress }),
    collectionMint: collectionAddress,
    authority: umi.identity,
  });
  
  transaction.sendAndConfirm(umi);
  
  console.log(
    `✅ NFT ${nftAddress} verified as member of collection ${collectionAddress}! See Explorer at ${getExplorerLink(
      "address",
      nftAddress,
      "devnet"
    )}`
  );