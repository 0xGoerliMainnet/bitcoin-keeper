import { all, call, spawn } from 'redux-saga/effects';
import {
  addNewVaultWatcher,
  addNewWalletsWatcher,
  addSigningDeviceWatcher,
  autoWalletsSyncWatcher,
  addressIndexIncrementWatcher,
  finaliseVaultMigrationWatcher,
  migrateVaultWatcher,
  refreshWalletsWatcher,
  syncWalletsWatcher,
  testcoinsWatcher,
  updateSignerPolicyWatcher,
  updateWalletDetailWatcher,
  updateWalletSettingsWatcher,
  updateSignerDetails,
  updateWalletsPropertyWatcher,
  addWhirlpoolWalletsWatcher,
  addWhirlpoolWalletsLocalWatcher,
  updateWalletPathAndPuposeDetailWatcher,
  finaliseIKSetupWatcher,
} from './wallets';
import {
  addUaiStackWatcher,
  uaiActionedEntityWatcher,
  uaiActionedWatcher,
  uaiChecksWatcher,
} from './uai';
import {
  changeAuthCredWatcher,
  changeLoginMethodWatcher,
  credentialStorageWatcher,
  credentialsAuthWatcher,
  resetPinCredWatcher,
  generateSeedHashWatcher,
} from './login';
import {
  backupWarningWatcher,
  getAppImageWatcher,
  healthCheckSignerWatcher,
  recoverBackupWatcher,
  seedBackedUpWatcher,
  seedBackeupConfirmedWatcher,
  updateAppImageWatcher,
  updateVaultImageWatcher,
} from './bhr';
import {
  calculateCustomFeeWatcher,
  calculateSendMaxFeeWatcher,
  corssTransferWatcher,
  fetchExchangeRatesWatcher,
  fetchFeeRatesWatcher,
  sendPhaseOneWatcher,
  sendPhaseThreeWatcher,
  sendPhaseTwoWatcher,
} from './send_and_receive';
import { getMessageWatcher, updateFCMTokensWatcher } from './notifications';

import { setupKeeperAppWatcher, setupKeeperVaultRecoveryAppWatcher } from './storage';
import { migrateLablesWatcher, updateVersionHistoryWatcher } from './upgrade';
import { addLabelsWatcher, bulkUpdateLabelWatcher, bulkUpdateUTXOLabelWatcher } from './utxos';
import { connectToNodeWatcher } from './network';

const rootSaga = function* () {
  const sagas = [
    // login
    credentialsAuthWatcher,
    changeAuthCredWatcher,
    generateSeedHashWatcher,
    changeLoginMethodWatcher,
    credentialStorageWatcher,
    resetPinCredWatcher,
    setupKeeperAppWatcher,

    // network
    connectToNodeWatcher,

    // notification
    updateFCMTokensWatcher,
    getMessageWatcher,

    // wallet
    addNewWalletsWatcher,
    addWhirlpoolWalletsWatcher,
    addWhirlpoolWalletsLocalWatcher,
    autoWalletsSyncWatcher,
    addressIndexIncrementWatcher,
    refreshWalletsWatcher,
    syncWalletsWatcher,
    updateWalletSettingsWatcher,
    updateSignerPolicyWatcher,
    testcoinsWatcher,
    updateWalletDetailWatcher,
    updateWalletsPropertyWatcher,

    // vaults
    addNewVaultWatcher,
    addSigningDeviceWatcher,
    migrateVaultWatcher,
    finaliseVaultMigrationWatcher,
    finaliseIKSetupWatcher,
    updateSignerDetails,

    // send and receive
    fetchExchangeRatesWatcher,
    fetchFeeRatesWatcher,
    sendPhaseOneWatcher,
    sendPhaseTwoWatcher,
    sendPhaseThreeWatcher,
    corssTransferWatcher,
    calculateSendMaxFeeWatcher,
    calculateCustomFeeWatcher,

    // UAI
    uaiChecksWatcher,
    addUaiStackWatcher,
    uaiActionedWatcher,
    uaiActionedEntityWatcher,

    // BHR
    updateAppImageWatcher,
    updateVaultImageWatcher,
    getAppImageWatcher,
    seedBackedUpWatcher,
    seedBackeupConfirmedWatcher,
    recoverBackupWatcher,
    healthCheckSignerWatcher,
    backupWarningWatcher,
    setupKeeperVaultRecoveryAppWatcher,
    updateWalletPathAndPuposeDetailWatcher,
    // upgrade
    updateVersionHistoryWatcher,
    migrateLablesWatcher,

    // utxos
    addLabelsWatcher,
    bulkUpdateLabelWatcher,
    bulkUpdateUTXOLabelWatcher,
  ];

  yield all(
    sagas.map((saga) =>
      spawn(function* () {
        while (true) {
          try {
            yield call(saga);
            break;
          } catch (err) {
            console.log(err);
          }
        }
      })
    )
  );
};

export default rootSaga;
