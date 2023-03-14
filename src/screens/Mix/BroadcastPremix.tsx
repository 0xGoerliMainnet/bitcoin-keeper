import { Box } from 'native-base';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import Buttons from 'src/components/Buttons';
import Text from 'src/components/KeeperText';
import UtxoSummary from './UtxoSummary';
import PageIndicator from 'src/components/PageIndicator';
import KeeperModal from 'src/components/KeeperModal';
import { useAppSelector } from 'src/store/hooks';
import { SatsToBtc } from 'src/common/constants/Bitcoin';

const utxos = [
  { transactionId: 1, amount: 0.0001 },
  { transactionId: 2, amount: 0.0001 },
  { transactionId: 3, amount: 0.0001 },
  { transactionId: 4, amount: 0.0001 },
  { transactionId: 5, amount: 0.0001 },
];

const broadcastModalContent = (onBroadcastModalCallback) => {
  return (
    <Box>
      <Box>
        <Text color="light.secondaryText" style={styles.premixInstructionText}>
          <Text style={{ fontWeight: 'bold' }}>Premix</Text> This wallet contains the UTXOs from
          your premix transaction (also called the Tx0). Your premix transaction splits your UTXOs
          into equal amounts ready for mixing.
        </Text>
        <Text color="light.secondaryText" style={styles.premixInstructionText}>
          <Text style={{ fontWeight: 'bold' }}>Postmix</Text> This wallet contains the UTXOs from
          your mixes. Whirlpool will select UTXOs from both the Premix and the Postmix wallets to
          include in coinjoin transactions. Funds in this wallet can be considered mixed and are
          safe to spend anonymously, especially after a number of mixing rounds.
        </Text>
        <Text color="light.secondaryText" style={styles.premixInstructionText}>
          <Text style={{ fontWeight: 'bold' }}>Badbank</Text> This wallet contains the change from
          your premix (Tx0) transaction - whatever is left over from splitting your input UTXOs into
          equal amounts. Consider mixing any UTXOs here if they are large enough, but do not combine
          them with mixed funds.
        </Text>
      </Box>
      <Box style={styles.modalFooter}>
        <Buttons primaryText="Proceed" primaryCallback={() => onBroadcastModalCallback()} />
      </Box>
    </Box>
  );
};

export default function BroadcastPremix({ route, navigation }) {
  const { scode, fee, utxos, utxoCount, utxoTotal, pool, premixOutputCount } = route.params;
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const { satsEnabled } = useAppSelector((state) => state.settings);
  const [premixOutputs, setPremixOutputs] = useState([]);
  const [badbankChange, setBadbankChange] = useState(0);

  useEffect(() => {
    setPremixOutputsAndBadbank();
  }, []);

  const setPremixOutputsAndBadbank = () => {
    const outputs = [];
    for (let i = 0; i < premixOutputCount; i++) {
      outputs.push({ amount: pool.must_mix_balance_cap });
    }
    setPremixOutputs(outputs);
    setBadbankChange(
      utxoTotal - fee.averageTxFee - pool.fee_value - pool.must_mix_balance_cap * premixOutputCount
    );
  };

  const onBroadcastPremix = () => {
    setShowBroadcastModal(true);
  };

  const closeBroadcastModal = async () => {
    setShowBroadcastModal(false);
  };

  const onBroadcastModalCallback = () => {
    setShowBroadcastModal(false);
    navigation.navigate('WalletDetails');
  };

  const valueByPreferredUnit = (value) => {
    if (!value) return '';
    const valueInPreferredUnit = satsEnabled ? value : SatsToBtc(value);
    return valueInPreferredUnit;
  };

  const getPreferredUnit = () => {
    return satsEnabled ? 'sats' : 'btc';
  };

  return (
    <ScreenWrapper backgroundColor="light.mainBackground" barStyle="dark-content">
      <HeaderTitle
        paddingLeft={25}
        title="Broadcast Premix Transaction"
        subtitle="Your premix transaction is ready to be broadcast. Please review the details below and click the button to broadcast your transaction."
      />
      <UtxoSummary utxoCount={utxoCount} totalAmount={utxoTotal} />
      <Box style={styles.textArea}>
        <Text color="#017963" style={styles.textWidth}>
          Whirlpool Fee
        </Text>
        <Box style={styles.textDirection}>
          <Text color="light.secondaryText">{valueByPreferredUnit(pool?.fee_value)}</Text>
          <Text color="light.secondaryText" style={{ paddingLeft: 5 }}>
            {getPreferredUnit()}
          </Text>
        </Box>
      </Box>
      <Box style={styles.textArea}>
        <Text color="#017963" style={styles.textWidth}>
          Badbank Change
        </Text>
        <Box style={styles.textDirection}>
          <Text color="light.secondaryText">{valueByPreferredUnit(badbankChange)}</Text>
          <Text color="light.secondaryText" style={{ paddingLeft: 5 }}>
            {getPreferredUnit()}
          </Text>
        </Box>
      </Box>
      {premixOutputs &&
        premixOutputs.map((output, index) => {
          return (
            <Box style={styles.textArea}>
              <Text color="#017963" style={styles.textWidth}>
                Premix #{index + 1}
              </Text>
              <Box style={styles.textDirection}>
                <Text color="light.secondaryText">{valueByPreferredUnit(output.amount)}</Text>
                <Text color="light.secondaryText" style={{ paddingLeft: 5 }}>
                  {getPreferredUnit()}
                </Text>
              </Box>
            </Box>
          );
        })}
      <Box style={styles.textArea}>
        <Text color="#017963" style={styles.textWidth}>
          Fee
        </Text>
        <Box style={styles.textDirection}>
          <Text color="light.secondaryText">{valueByPreferredUnit(fee?.averageTxFee)}</Text>
          <Text color="light.secondaryText" style={{ paddingLeft: 5 }}>
            {getPreferredUnit()}
          </Text>
        </Box>
      </Box>
      <Box style={styles.footerContainer}>
        <Box style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Box style={{ alignSelf: 'center', paddingBottom: 4, paddingLeft: 20 }}>
            <PageIndicator currentPage={2} totalPage={2} />
          </Box>
          <Box style={styles.footerItemContainer}>
            <Buttons primaryText="Broadcast Premix" primaryCallback={() => onBroadcastPremix()} />
          </Box>
        </Box>
      </Box>
      <KeeperModal
        justifyContent="flex-end"
        visible={showBroadcastModal}
        close={closeBroadcastModal}
        title="Broadcast Premix"
        subTitle="Initiating your first coinjoin will add three new wallets to your existing wallet: Premix, Postmix and Badbank."
        subTitleColor="#5F6965"
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonText=""
        buttonTextColor="#FAFAFA"
        buttonCallback={closeBroadcastModal}
        closeOnOverlayClick={false}
        Content={() => broadcastModalContent(onBroadcastModalCallback)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  textArea: {
    marginTop: 20,
    marginLeft: 50,
    flexDirection: 'row',
  },
  textWidth: {
    width: '45%',
  },
  textDirection: {
    flexDirection: 'row',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    width: wp(375),
    paddingHorizontal: 5,
  },
  footerItemContainer: {
    flexDirection: 'row',
    marginTop: windowHeight > 800 ? 5 : 5,
    marginBottom: windowHeight > 800 ? hp(10) : 0,
    paddingBottom: 15,
    justifyContent: 'flex-end',
    marginHorizontal: 16,
  },
  premixInstructionText: {
    fontSize: 12,
    paddingTop: 10,
  },
  modalFooter: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    marginBottom: 10,
  },
});
