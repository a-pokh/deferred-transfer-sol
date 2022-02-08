import { Program, web3, BN } from '@project-serum/anchor';
import * as spl from '@solana/spl-token';

import { getProvider } from './provider';
import idl from '../idl/deferred_transfer_sol.json';

const { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } = web3;

const PROGRAM_ID = new PublicKey(idl.metadata.address);

export async function getWalletTokens(wallet) {
  const program = await createProgram(wallet);
  const { provider } = program;

  const { value: walletTokenAccounts } = await provider.connection.getParsedTokenAccountsByOwner(
    provider.wallet.publicKey, 
    { programId: spl.TOKEN_PROGRAM_ID }
  )


  return walletTokenAccounts;
}

async function createProgram(wallet) {
  const provider = await getProvider(wallet);

  return new Program(idl, PROGRAM_ID, provider);
}

