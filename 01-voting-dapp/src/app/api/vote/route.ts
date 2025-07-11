import { BN, Program } from '@coral-xyz/anchor'
// https://solana.com/ko/developers/guides/advanced/actions

import { ActionGetResponse, ActionPostRequest, ACTIONS_CORS_HEADERS, createPostResponse } from '@solana/actions'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { Voting } from '../../../../anchor/target/types/voting'
import { Anchor } from 'lucide-react'
import { headers } from 'next/headers'
const IDL = require('../../../../anchor/target/idl/voting.json')

export const OPTIONS = GET

export async function GET(request: Request) {
  const actionMetadata: ActionGetResponse = {
    icon: 'https://media.istockphoto.com/id/1305693160/photo/peanut-butter-in-an-open-jar-and-peanuts-in-the-skin-are-scattered-on-the-blue-table-space.jpg?s=612x612&w=0&k=20&c=tNH17gPzOwX3HizAcAW4uPMksO4GOLCVK_f-Ehbe2_E=',
    title: 'Vote for your favorite type of Peanut Butter',
    description: 'Crunchy or Smooth, Which is superior?',
    label: 'Vote',
    links: {
      actions: [
        {
          type: 'transaction',
          label: 'Vote for Crunchy',
          href: '/api/vote?candidate=Crunchy',
        },
        {
          type: 'post',
          label: 'Vote for Smooth',
          href: '/api/vote?candidate=Smooth',
        },
      ],
    },
  }
  return Response.json(actionMetadata, { headers: ACTIONS_CORS_HEADERS })
}

export async function POST(request: Request) {
  const url = new URL(request.url)
  const candidate = url.searchParams.get('candidate')

  if (candidate != 'Crunchy' && candidate != 'Smooth') {
    return new Response('Invalid Candidate', { status: 400, headers: ACTIONS_CORS_HEADERS })
  }

  const connection = new Connection('http://127.0.0.1:8899', 'confirmed')
  const program: Program<Voting> = new Program(IDL, { connection })
  const body: ActionPostRequest = await request.json()
  let voter

  try {
    voter = new PublicKey(body.account)
  } catch (error) {
    return new Response('Invalid account', { status: 400, headers: ACTIONS_CORS_HEADERS })
  }

  const instruction = await program.methods
    .vote(candidate, new BN(1))
    .accounts({
      signer: voter,
    })
    .instruction()

  const blockhash = await connection.getLatestBlockhash()

  const transaction = new Transaction({
    feePayer: voter,
    blockhash: blockhash.blockhash,
    lastValidBlockHeight: blockhash.lastValidBlockHeight,
  }).add(instruction)

  const response = await createPostResponse({
    fields: {
      type: "transaction",
      transaction: transaction,
    },
  })

  return Response.json(response, {headers: ACTIONS_CORS_HEADERS})
}
