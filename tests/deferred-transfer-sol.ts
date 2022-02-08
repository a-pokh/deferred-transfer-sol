import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";
import { DeferredTransferSol } from '../target/types/deferred_transfer_sol';

const { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } = anchor.web3;

const receiver = 'GbnsccL6TDQbQZBhQedK46KbptTfbaxwhMVgrckwK8TT'

describe('deferred-transfer-sol', () => {

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.DeferredTransferSol as Program<DeferredTransferSol>;

  let mintAccount = new PublicKey('6wg23QyE7YboFeX9CBDLvbdg5gmzDSL99NdHhPcEv8ah');
  let tokenAccount = new PublicKey('Ej3gb48LJbfyYJ4HRh7RU1HW73HjCaTmxGfhDQR5Lqzq');
  let amount = 111 * (10 ** 9); // 9 decimals

  const transferTokenAccountKeypair = anchor.web3.Keypair.generate();
  const transferTokenAccount = transferTokenAccountKeypair.publicKey;

  it('Is initialized', async () => {
    const provider = anchor.Provider.local();
    const initializer = provider.wallet.publicKey;

    console.log(transferTokenAccount.toString())

//    const { value: walletTokenAccounts } = await provider.connection.getParsedTokenAccountsByOwner(
//      provider.wallet.publicKey, 
//      { programId: TOKEN_PROGRAM_ID }
//    )
//
//
//    for(let walletTokenAccount of walletTokenAccounts) {
//      const { tokenAmount: { uiAmount }, mint } = walletTokenAccount.account.data.parsed.info;
//
//
//      if(uiAmount === 999) {
//        console.log(mint)
//        console.log(walletTokenAccount.pubkey.toString())
//      }

//    }

    const [state, stateBump] = await PublicKey.findProgramAddress(
      [initializer.toBuffer()],
      program.programId
    )

    await program.rpc.initialize(new anchor.BN(amount), new anchor.BN(stateBump), {
      accounts: {
        state,
        initializer,
        tokenAccount,
        transferTokenAccount,
        mintAccount,
        receiver,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      },
      signers: [transferTokenAccountKeypair]
    });
  });

  it('Does check days', async () => {
    const provider = anchor.Provider.local();
    const initializer = provider.wallet.publicKey;

    const [state, bump] = await PublicKey.findProgramAddress(
      [initializer.toBuffer()],
      program.programId
    )

    for(let i = 0; i <= 10; i++) {
      await program.rpc.checkDays(new anchor.BN(bump), {
        accounts: {
          state,
          tokenProgram: TOKEN_PROGRAM_ID,
          transferTokenAccount,
        },
      });
    }

    let stateAcc = await program.account.state.fetch(state);

    console.log(stateAcc)
  });

  it('Does check in!', async () => {
    const provider = anchor.Provider.local();
    const initializer = provider.wallet.publicKey;

    const [state] = await PublicKey.findProgramAddress(
      [initializer.toBuffer()],
      program.programId
    )

    await program.rpc.checkIn({
      accounts: {
        state,
        initializer,
      },
    });

    let stateAcc = await program.account.state.fetch(state);

    console.log(stateAcc)
  });

  it('Allows to withdraw back', async () => {
    const provider = anchor.Provider.local();
    const initializer = provider.wallet.publicKey;

    const [state] = await PublicKey.findProgramAddress(
      [initializer.toBuffer()],
      program.programId
    )

    await program.rpc.checkIn({
      accounts: {
        state,
        initializer,
      },
    });

    let stateAcc = await program.account.state.fetch(state);

    console.log(stateAcc)
  });
});
