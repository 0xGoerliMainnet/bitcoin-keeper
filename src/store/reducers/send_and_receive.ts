import {
  SerializedPSBTEnvelop,
  SigningPayload,
  TransactionPrerequisite,
  TransactionPrerequisiteElements,
} from 'src/core/wallets/interfaces/';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { Satoshis } from 'src/models/types/UnitAliases';
import TransactionFeeSnapshot from 'src/models/types/TransactionFeeSnapshot';
import { TxPriority } from 'src/core/wallets/enums';
import idx from 'idx';

export interface SendPhaseOneExecutedPayload {
  successful: boolean;
  outputs?: {
    txPrerequisites?: TransactionPrerequisite;
    recipients?: {
      address: string;
      amount: number;
      name?: string;
    }[];
  };
  err?: string;
}

export interface SendPhaseTwoExecutedPayload {
  successful: boolean;
  serializedPSBTEnvelops?: SerializedPSBTEnvelop[];
  txid?: string;
  err?: string;
}

export interface UpdatePSBTPayload {
  signedSerializedPSBT?: string;
  signingPayload?: SigningPayload[];
  signerId: string;
  txHex?: string;
}

export interface SendPhaseThreeExecutedPayload {
  successful: boolean;
  txid?: string;
  err?: string;
}

export type TransactionFeeInfo = Record<TxPriority, TransactionFeeSnapshot>;

const initialState: {
  sendPhaseOne: {
    inProgress: boolean;
    hasFailed: boolean;
    failedErrorMessage: string | null;
    isSuccessful: boolean;
    outputs: {
      txPrerequisites: TransactionPrerequisite;
      recipients: { address: string; amount: number }[];
    } | null;
  };
  customPrioritySendPhaseOne: {
    inProgress: boolean;
    hasFailed: boolean;
    failedErrorMessage: string | null;
    isSuccessful: boolean;
    outputs: { customTxPrerequisites: TransactionPrerequisiteElements } | null;
  };
  sendPhaseTwo: {
    inProgress: boolean;
    hasFailed: boolean;
    failedErrorMessage: string | null;
    isSuccessful: boolean;
    serializedPSBTEnvelops: SerializedPSBTEnvelop[];
    txid: string | null;
  };
  sendPhaseThree: {
    inProgress: boolean;
    hasFailed: boolean;
    failedErrorMessage: string | null;
    isSuccessful: boolean;
    txid: string | null;
  };
  crossTransfer: {
    hasFailed: boolean;
    isSuccessful: boolean;
  };
  sendMaxFee: number;
  feeIntelMissing: boolean;
  transactionFeeInfo: TransactionFeeInfo;
} = {
  sendPhaseOne: {
    inProgress: false,
    hasFailed: false,
    failedErrorMessage: null,
    isSuccessful: false,
    outputs: null,
  },
  customPrioritySendPhaseOne: {
    inProgress: false,
    hasFailed: false,
    failedErrorMessage: null,
    isSuccessful: false,
    outputs: null,
  },
  sendPhaseTwo: {
    inProgress: false,
    hasFailed: false,
    failedErrorMessage: null,
    isSuccessful: false,
    serializedPSBTEnvelops: null,
    txid: null,
  },
  sendPhaseThree: {
    inProgress: false,
    hasFailed: false,
    failedErrorMessage: null,
    isSuccessful: false,
    txid: null,
  },
  crossTransfer: {
    hasFailed: false,
    isSuccessful: false,
  },
  sendMaxFee: 0,
  feeIntelMissing: false,
  transactionFeeInfo: {
    [TxPriority.LOW]: {
      amount: 0,
      estimatedBlocksBeforeConfirmation: 50,
    },
    [TxPriority.MEDIUM]: {
      amount: 0,
      estimatedBlocksBeforeConfirmation: 20,
    },
    [TxPriority.HIGH]: {
      amount: 0,
      estimatedBlocksBeforeConfirmation: 4,
    },
    [TxPriority.CUSTOM]: {
      amount: 0,
      estimatedBlocksBeforeConfirmation: 0,
    },
  },
};

const sendAndReceiveSlice = createSlice({
  name: 'sendAndReceive',
  initialState,
  reducers: {
    setSendMaxFee: (state, action: PayloadAction<Satoshis>) => {
      state.sendMaxFee = action.payload;
    },

    sendPhaseOneExecuted: (state, action: PayloadAction<SendPhaseOneExecutedPayload>) => {
      const { transactionFeeInfo } = state;
      let txPrerequisites: TransactionPrerequisite;
      let recipients;
      const { successful, outputs, err } = action.payload;
      if (successful) {
        txPrerequisites = outputs.txPrerequisites;
        recipients = outputs.recipients;
        Object.keys(txPrerequisites).forEach((priority) => {
          transactionFeeInfo[priority].amount = txPrerequisites[priority].fee;
          transactionFeeInfo[priority].estimatedBlocksBeforeConfirmation =
            txPrerequisites[priority].estimatedBlocks;
        });
      }
      state.sendPhaseOne = {
        ...state.sendPhaseOne,
        inProgress: false,
        hasFailed: !successful,
        failedErrorMessage: !successful ? err : null,
        isSuccessful: successful,
        outputs: {
          txPrerequisites,
          recipients,
        },
      };
      state.transactionFeeInfo = transactionFeeInfo;
    },

    sendPhaseTwoExecuted: (state, action: PayloadAction<SendPhaseTwoExecutedPayload>) => {
      const { successful, txid, serializedPSBTEnvelops, err } = action.payload;
      state.sendPhaseTwo = {
        inProgress: false,
        hasFailed: !successful,
        failedErrorMessage: !successful ? err : null,
        isSuccessful: successful,
        serializedPSBTEnvelops: successful ? serializedPSBTEnvelops : null,
        txid: successful ? txid : null,
      };
    },

    updatePSBTEnvelops: (state, action: PayloadAction<UpdatePSBTPayload>) => {
      const { signerId, signingPayload, signedSerializedPSBT, txHex } = action.payload;
      state.sendPhaseTwo = {
        ...state.sendPhaseTwo,
        serializedPSBTEnvelops: state.sendPhaseTwo.serializedPSBTEnvelops.map((envelop) => {
          if (envelop.signerId === signerId) {
            envelop.serializedPSBT = signedSerializedPSBT || envelop.serializedPSBT;
            envelop.isSigned =
              signedSerializedPSBT ||
              txHex || // for coldcard and keystone
              !!idx(signingPayload, (_) => _[0].inputsToSign[0].signature) // for tapsigner
                ? true
                : envelop.isSigned;
            envelop.signingPayload = signingPayload || envelop.signingPayload;
            envelop.txHex = txHex || envelop.txHex;
          }
          return envelop;
        }),
      };
    },

    sendPhaseThreeExecuted: (state, action: PayloadAction<SendPhaseThreeExecutedPayload>) => {
      const { successful, txid, err } = action.payload;
      state.sendPhaseThree = {
        inProgress: false,
        hasFailed: !successful,
        failedErrorMessage: !successful ? err : null,
        isSuccessful: successful,
        txid: successful ? txid : null,
      };
    },

    crossTransferFailed: (state) => {
      state.crossTransfer.hasFailed = true;
    },
    crossTransferExecuted: (state) => {
      state.crossTransfer.isSuccessful = true;
    },

    sendPhasesReset: (state) => {
      state.sendMaxFee = 0;
      state.sendPhaseOne = initialState.sendPhaseOne;
      state.sendPhaseTwo = initialState.sendPhaseTwo;
      state.sendPhaseThree = initialState.sendPhaseThree;
    },
    sendPhaseOneReset: (state) => {
      state.sendPhaseOne = initialState.sendPhaseOne;
      state.sendPhaseTwo = initialState.sendPhaseTwo;
      state.sendPhaseThree = initialState.sendPhaseThree;
    },
    sendPhaseTwoReset: (state) => {
      state.sendPhaseTwo = initialState.sendPhaseTwo;
      state.sendPhaseThree = initialState.sendPhaseThree;
    },
    sendPhaseThreeReset: (state) => {
      state.sendPhaseThree = initialState.sendPhaseThree;
    },
    crossTransferReset: (state) => {
      state.crossTransfer = initialState.crossTransfer;
    },
    sendPhaseTwoStarted: (state) => {
      state.sendPhaseTwo = { ...state.sendPhaseTwo, inProgress: true };
    },
  },
});

export const {
  setSendMaxFee,
  sendPhaseOneExecuted,
  sendPhaseTwoExecuted,
  sendPhaseThreeExecuted,
  crossTransferExecuted,
  crossTransferFailed,
  crossTransferReset,
  sendPhasesReset,
  sendPhaseOneReset,
  sendPhaseTwoReset,
  sendPhaseThreeReset,
  updatePSBTEnvelops,
  sendPhaseTwoStarted,
} = sendAndReceiveSlice.actions;
export default sendAndReceiveSlice.reducer;
