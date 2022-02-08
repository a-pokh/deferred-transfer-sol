import React from 'react';
import styled from 'styled-components';

import { ConnectButton } from './WalletProvider';

function Header() {
  return (
    <HeaderWrapper>
      <ConnectButton />
    </HeaderWrapper>
  );
}

export function Layout ({ children }) {
  return (
    <>
      <Header />
      <BodyWrapper>
        <div>
          {children}
        </div>
      </BodyWrapper>
    </>
  );
}

const HeaderWrapper = styled.div`
  width: 100%;
  padding: 8px;
  box-shadow: 0 4px 2px -2px gray;
`;

const BodyWrapper = styled.div`
  height: calc(100vh - 66px);
  display: flex;
  align-items: center;
  justify-content: center;

  & > div {
    width: 520px;
    height: 600px;
    border-radius: 4px;
    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
    transition: 0.3s;
    padding: 16px;

    &:hover {
      box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
    }
  }
`;
