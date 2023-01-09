import { ObjectSchema } from 'realm';
import { SubscriptionTier } from 'src/common/data/enums/SubscriptionTier';
import { RealmSchema } from '../enum';

export const StoreSubscriptionSchema: ObjectSchema = {
  name: RealmSchema.StoreSubscription,
  properties: {
    name: {
      type: 'string',
      default: SubscriptionTier.L1,
    },
    productId: {
      type: 'string',
      default: SubscriptionTier.L1,
    },
    receipt: {
      type: 'string?',
      default: '',
    },
    level: {
      type: 'int',
      default: 1,
    },
    icon: {
      type: 'string',
      default: 'assets/ic_pleb.svg',
    },
  },
};

export const KeeperAppSchema: ObjectSchema = {
  name: RealmSchema.KeeperApp,
  properties: {
    id: 'string',
    appID: 'string',
    appName: 'string?',
    primaryMnemonic: 'string',
    primarySeed: 'string',
    imageEncryptionKey: 'string',
    walletShellInstances: RealmSchema.WalletShellInstances,
    vaultShellInstances: RealmSchema.VaultShellInstances,
    twoFADetails: `${RealmSchema.TwoFADetails}?`,
    nodeConnect: `${RealmSchema.NodeConnect}?`,
    uai: `${RealmSchema.UAI}?`,
    notification: `${RealmSchema.Notification}?`,
    subscription: {
      type: RealmSchema.StoreSubscription,
    },
    version: 'string',
    backupPassword: {
      type: 'string?',
      default: '',
    },
    backupPasswordHint: {
      type: 'string?',
      default: '',
    },
    backupMethod: {
      type: 'string?',
      default: '',
    },
    networkType: 'string',
  },
  primaryKey: 'id',
};
