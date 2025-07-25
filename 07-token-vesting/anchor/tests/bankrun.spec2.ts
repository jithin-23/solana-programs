// import * as anchor from '@coral-xyz/anchor'
// import { Keypair, PublicKey } from '@solana/web3.js'
// import { BanksClient, ProgramTestContext, startAnchor } from 'solana-bankrun'
// import { SYSTEM_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/native/system'
// import { BN, Program} from "@coral-xyz/anchor";
// import { BankrunProvider } from "anchor-bankrun";
// import { createMint } from 'spl-token-bankrun';

// import IDL from '../target/idl/vesting.json'
// import { Vesting } from 'anchor/target/types/vesting';
// import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';

// describe('Vesting Smart Contract Test', () => {
//   let beneficiary: Keypair;
//   let context: ProgramTestContext;
//   let provider: BankrunProvider;
//   let program: Program<Vesting>;
//   let banksClient: BanksClient;
//   let employer: Keypair;
//   let mint: PublicKey;
//   let beneficiaryProvider: BankrunProvider;
//   let program2: Program<Vesting>;

//   beforeAll(async () => {

//     beneficiary = new anchor.web3.Keypair()

//     context = await startAnchor(
//       '',
//       [{ name: 'vesting', programId: new PublicKey(IDL.address) }],
//       [
//         {
//           address: beneficiary.publicKey,
//           info: {
//             lamports: 1000000000,
//             data: Buffer.alloc(0),
//             owner: SYSTEM_PROGRAM_ID,
//             executable: false,
//           },
//         },
//       ],
//     );

//     provider = new BankrunProvider(context);

//     anchor.setProvider(provider);

//     program = new anchor.Program<Vesting>(IDL as Vesting, provider);

//     banksClient = context.banksClient;

//     employer = provider.wallet.payer; 

//     // @ts-ignore
//     mint = await createMint(banksClient, employer, employer.publicKey, null, 2);

//     beneficiaryProvider = new BankrunProvider(context);
//     beneficiaryProvider.wallet = new NodeWallet(beneficiary);

//     program2 = new Program<Vesting>(IDL as Vesting, beneficiaryProvider);

//     [ vestingAccountKey ] = PublicKey.findProgramAddressSync (
//         [Buffer.from(companyName)]
//     )

//   })
// })
