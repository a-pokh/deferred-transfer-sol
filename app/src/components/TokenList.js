import React from 'react';
import styled from 'styled-components';

import { useWalletTokensList } from '../hooks/wallet';

export function TokenList ({ onTokenSelect = () => {} }) {
  const { tokenAccounts } = useWalletTokensList();

  return (
    <Wrapper>
      <h3>Your tokens</h3>
      {tokenAccounts.map(({ pubkey, mint, amount }) => (
        <div onClick={() => onTokenSelect(pubkey)} key={pubkey}>
          <div><div></div></div>
          <div>
            <b>{pubkey}</b>
            <br />
            <span>Mint: {mint}</span>
          </div>
          <div>{amount}</div>
        </div>
      ))}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  & > div {
    display: flex;
    border-bottom: 1px solid lightgray;
    font-size: 12px;
    padding: 6px 4px;
    cursor: pointer;

    &:hover {
      background: lightgray;
    }

    & > div:nth-child(1) {
      width: 40px;
      display: flex;
      align-items: center;
      justify-content: center;

      & > div {
        width: 26px;
        height: 26px;
        background: gray;
        border-radius: 4px;
      }
    }
    
    & > div:nth-child(2) {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;

      & > span {
        font-size: 10px;
        color: gray;
      }
    }
    
    & > div:nth-child(3) {
      width: 60px;
      text-align: right;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`;

