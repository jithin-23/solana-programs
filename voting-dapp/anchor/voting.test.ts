import * as anchor from '@coral-xyz/anchor'
import { BankrunProvider, startAnchor } from 'anchor-bankrun'
import { Program } from '@coral-xyz/anchor'
import { Keypair, PublicKey } from '@solana/web3.js'
import { Voting } from './target/types/voting'
import { Anchor } from 'lucide-react'

const IDL = require('./target/idl/voting.json')

const votingAddress = new PublicKey('FqzkXZdwYjurnUKetJCAvaUw5WAqbwzU6gZEwydeEfqS')

describe('Voting', () => {
  let context
  let provider
  let votingProgram: Program<Voting>

  beforeAll(async () => {
    context = await startAnchor('', [{ name: 'voting', programId: votingAddress }], [])
    provider = new BankrunProvider(context)
    votingProgram = new Program<Voting>(IDL, provider)
  })

  it('Initialize Poll', async () => {
    await votingProgram.methods
      .initializePoll(
        new anchor.BN(1),
        'What is your favourite type of Peanut Butter?',
        new anchor.BN(0),
        new anchor.BN(1815018488),
      )
      .rpc()

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
      votingAddress,
    )

    const poll = await votingProgram.account.poll.fetch(pollAddress)

    console.log(poll)
  })

  it('initialize candidate', async () => {
    await votingProgram.methods.initializeCandidate('Smooth', new anchor.BN(1)).rpc()
    await votingProgram.methods.initializeCandidate('Crunchy', new anchor.BN(1)).rpc()

    const [crunchyAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from('Crunchy')],
      votingAddress,
    )
    const crunchyCandidate = await votingProgram.account.candidate.fetch(crunchyAddress)
    console.log('Candidate 1:', crunchyCandidate)
    expect(crunchyCandidate.candidateVotes.toNumber()).toEqual(0)

    const [smoothAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from('Smooth')],
      votingAddress,
    )
    const smoothCandidate = await votingProgram.account.candidate.fetch(smoothAddress)
    console.log('Candidate 2:', smoothCandidate)
    expect(smoothCandidate.candidateVotes.toNumber()).toEqual(0)
  })

  it('vote', async () => {
    await votingProgram.methods.vote('Smooth', new anchor.BN(1)).rpc()
    const [smoothAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from('Smooth')],
      votingAddress,
    )
    const smoothCandidate = await votingProgram.account.candidate.fetch(smoothAddress)
    expect(smoothCandidate.candidateVotes.toNumber()).toEqual(1)
  })
})
