import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

import { getWalletTokens } from '../services/wallet';

export function useWalletTokensList() {
  const wallet = useWallet();
  const [list, setList] = useState([]);

  useEffect(() => {
    async function getList() {
      const tokens = await getWalletTokens(wallet);


      const mapped = tokens.map(({ account: { data: { parsed: { info } } }, pubkey }) => ({
        pubkey: pubkey.toString(),
        mint: info.mint,
        amount: info.tokenAmount.uiAmount,
      }))

      setList(mapped);
    }

    if(wallet.publicKey) {
      getList();
    }
  }, [wallet])

  return { tokenAccounts: list };
}

