import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

import { getProgramState } from '../services/programState.js';

export function useProgramState() {
  const wallet = useWallet();
  const [state, setState] = useState(null);

  useEffect(() => {
    async function getState() {
      const _state = await getProgramState(wallet);
      setState(_state);
    }

    if(wallet.publicKey) {
      getState();
    }
  }, [wallet])

  return { programState: state };
}

