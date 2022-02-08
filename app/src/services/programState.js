import { Program, web3, BN } from '@project-serum/anchor';
import * as spl from '@solana/spl-token';

import { getProvider } from './provider';
import idl from '../idl/deferred_transfer_sol.json';

const { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } = web3;

const PROGRAM_ID = new PublicKey(idl.metadata.address);

export async function getProgramState(wallet) {
  const program = await createProgram(wallet);

  const [stateAccountKey] = await PublicKey.findProgramAddress(
    [wallet.publicKey.toBuffer()],
    PROGRAM_ID,
  )

  try {
    let stateAccount = await program.account.state.fetch(stateAccountKey);

    return stateAccount;
  } catch(e) {
    return null;
  }
}

async function createProgram(wallet) {
  const provider = await getProvider(wallet);

  return new Program(idl, PROGRAM_ID, provider);
}

