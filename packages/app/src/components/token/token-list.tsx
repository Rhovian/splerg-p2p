import React from 'react';
import { TokenIcon } from '../ui/icons';
import { TokenInfo } from '../../model/token';
import { useModal } from '../../context/modal-context';

interface TokenListProps {
  tokens: TokenInfo[];
  onSelect: (token: string) => void;
  currentToken: string;
  otherToken: string;
  modalId: string;
  modalType: 'fromTokenSelect' | 'toTokenSelect';
}

export const TokenList: React.FC<TokenListProps> = ({
  tokens,
  onSelect,
  otherToken,
  modalType,
}) => {
  const { closeModal } = useModal();

  return (
    <div className="modal-box">
      <form method="dialog">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={() => closeModal(modalType)}
        >
          ✕
        </button>
      </form>

      {/* <form onSubmit={handleSubmitCustomMint} className="mb-4">
        <label className="input input-bordered flex items-center gap-2">
          <input
            type="text"
            value={customMint}
            onChange={(e) => setCustomMint(e.target.value)}
            placeholder="Enter token mint address"
            className="grow"
          />
          <button
            type="submit"
            className="btn btn-ghost btn-sm"
            disabled={!customMint || customMint === otherToken}
          >
            Add
          </button>
        </label>
      </form> */}

      <div className="divider">choose token</div>

      <div className="flex flex-col gap-2">
        {tokens.map((token) => (
          <button
            key={token.symbol}
            className={`btn btn-ghost justify-start gap-2 ${
              token.symbol === otherToken ? 'btn-disabled opacity-50' : ''
            }`}
            onClick={() => {
              if (token.symbol) {
                onSelect(token.symbol);
                closeModal(modalType);
              }
            }}
            disabled={token.symbol === otherToken}
          >
            <TokenIcon mint={token.mint} />
            <span>{token.name}</span>
            <span className="text-ghost">{token.symbol}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
