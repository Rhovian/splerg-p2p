import { Message, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, TransactionInstruction } from '@solana/web3.js';
import { Schema } from 'borsh';
import * as borsh from 'borsh';

// Instruction enum for serialization
enum SwapInstructionKind {
  InitializeOrder = 0,
  DepositMakerTokens = 1,
  AssignTaker = 2,
  CompleteSwap = 3,
  CloseOrder = 4,
}

export class InitializeOrderArgs {
  instruction: number;
  makerAmount: bigint;
  takerAmount: bigint;

  constructor(args: { makerAmount: bigint; takerAmount: bigint }) {
    this.instruction = SwapInstructionKind.InitializeOrder;
    this.makerAmount = args.makerAmount;
    this.takerAmount = args.takerAmount;
  }

  static borshInstructionSchema = {
    struct: {
      instruction: 'u8',
      makerAmount: 'u64',
      takerAmount: 'u64',
    },
  } as Schema;
}

enum OrderState {
  Created = 0,
  TakerAssigned = 1,
  MakerDeposited = 2,
  Completed = 3,
}

export class SwapOrder {
  is_initialized: boolean;
  maker: PublicKey;
  taker: PublicKey | null;
  maker_token_mint: PublicKey;
  taker_token_mint: PublicKey;
  maker_amount: bigint;
  taker_amount: bigint;
  maker_token_account: PublicKey;
  taker_token_account: PublicKey | null;
  state: OrderState;

  constructor(fields: {
    is_initialized: boolean;
    maker: Uint8Array;
    taker: Uint8Array | null;
    maker_token_mint: Uint8Array;
    taker_token_mint: Uint8Array;
    maker_amount: bigint;
    taker_amount: bigint;
    maker_token_account: Uint8Array;
    taker_token_account: Uint8Array | null;
    state: number;
  }) {
    this.is_initialized = fields.is_initialized;
    this.maker = new PublicKey(fields.maker);
    this.taker = fields.taker ? new PublicKey(fields.taker) : null;
    this.maker_token_mint = new PublicKey(fields.maker_token_mint);
    this.taker_token_mint = new PublicKey(fields.taker_token_mint);
    this.maker_amount = fields.maker_amount;
    this.taker_amount = fields.taker_amount;
    this.maker_token_account = new PublicKey(fields.maker_token_account);
    this.taker_token_account = fields.taker_token_account
      ? new PublicKey(fields.taker_token_account)
      : null;
    this.state = fields.state as OrderState;
  }

  static borshAccountSchema = {
    struct: {
      is_initialized: 'u8',
      maker: { array: { type: 'u8', len: 32 } },
      taker: { option: { array: { type: 'u8', len: 32 } } },
      maker_token_mint: { array: { type: 'u8', len: 32 } },
      taker_token_mint: { array: { type: 'u8', len: 32 } },
      maker_amount: 'u64',
      taker_amount: 'u64',
      maker_token_account: { array: { type: 'u8', len: 32 } },
      taker_token_account: { option: { array: { type: 'u8', len: 32 } } },
      state: 'u8',
    },
  } as Schema;
}

export class InitializeOrderInstruction {
  static async create(
    programId: PublicKey,
    maker: PublicKey,
    makerTokenMint: PublicKey, 
    takerTokenMint: PublicKey,
    makerAmount: bigint,
    takerAmount: bigint,
    // Include blockhash if needed for versioned tx
    blockhash?: string
  ): Promise<TransactionInstruction | Message> {
    const [orderPda] = await PublicKey.findProgramAddress(
      [
        Buffer.from('order'),
        maker.toBuffer(),
        makerTokenMint.toBuffer(),
        takerTokenMint.toBuffer(),
      ],
      programId
    );

    const args = new InitializeOrderArgs({
      makerAmount,
      takerAmount,
    });

    const instructionData = Buffer.from(
      borsh.serialize(InitializeOrderArgs.borshInstructionSchema, args),
    );

    return new TransactionInstruction({
      programId,
      keys: [
        { pubkey: maker, isSigner: true, isWritable: true },
        { pubkey: orderPda, isSigner: false, isWritable: true },
        { pubkey: makerTokenMint, isSigner: false, isWritable: false },
        { pubkey: takerTokenMint, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      ],
      data: instructionData,
    });
  }
}