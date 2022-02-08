import React from 'react'
import { Layout } from './components/Layout';

import { useProgramState } from './hooks/programState.js';

import { TokenList } from './components/TokenList';
import { ProgramState } from './components/ProgramState';

export function App() {
  const { programState } = useProgramState();

  return (
    <Layout>
      {!programState && <ProgramState programState={programState} />}
      {programState && <TokenList />}
    </Layout>
  );
}

