import React from 'react';
import styled from 'styled-components';

export function ProgramState ({ programState }) {
  return (
    <Wrapper>
      <div>
        {programState.daysLeft}
      </div>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  height: 100%;
  padding: 16px;

  & > div:first-child {
    flex: 1;
  }

  & > div:last-child {
    width: 450px;
  }
`;

