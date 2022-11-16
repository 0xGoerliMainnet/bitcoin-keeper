import { Box, Link, Modal, Text } from 'native-base';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

import Close from 'src/assets/icons/modal_close.svg';
import CloseGreen from 'src/assets/icons/modal_close_green.svg';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const KeeperModal = (props: {
  visible: boolean;
  close: any;
  title?: string;
  subTitle?: string;
  subTitleWidth?: number;
  modalBackground?: string[];
  buttonBackground?: string[];
  buttonText?: string;
  buttonTextColor?: string;
  buttonCallback?: any;
  textColor?: string;
  subTitleColor?: string;
  DarkCloseIcon?: any;
  Content?: any;
  dismissible?: boolean;
  showButtons?: boolean;
  learnMore?: boolean;
  learnMoreCallback?: any;
  closeOnOverlayClick?: boolean;
  showCloseIcon?: boolean;
}) => {
  const {
    visible,
    close,
    title = 'Title',
    subTitle = null,
    subTitleWidth = wp(270),
    modalBackground = ['#F7F2EC', '#F7F2EC'],
    buttonBackground = ['#00836A', '#073E39'],
    buttonText = null,
    buttonTextColor = 'white',
    buttonCallback = props.close || null,
    textColor = '#000',
    subTitleColor = textColor,
    DarkCloseIcon = false,
    Content = () => <></>,
    dismissible = true,
    showButtons = true,
    learnMore = false,
    learnMoreCallback = () => {},
    closeOnOverlayClick = true,
    showCloseIcon = true,
  } = props;
  const { bottom } = useSafeAreaInsets();

  const bottomMargin = Platform.select<number>({ ios: bottom, android: 10 });
  if (!visible) {
    return null;
  }
  return (
    <Modal
      closeOnOverlayClick={closeOnOverlayClick}
      isOpen={visible}
      onClose={dismissible ? close : null}
      avoidKeyboard
      size="xl"
      _backdrop={{ bg: '#000', opacity: 0.8 }}
      justifyContent={'flex-end'}
    >
      <Modal.Content borderRadius={10} marginBottom={Math.max(5, bottomMargin)} maxHeight={'full'}>
        <GestureHandlerRootView>
          <Box
            bg={{
              linearGradient: {
                colors: modalBackground,
                start: [0, 0],
                end: [1, 1],
              },
            }}
            style={styles.container}
          >
            <TouchableOpacity style={styles.close} onPress={close}>
              {showCloseIcon ? DarkCloseIcon ? <CloseGreen /> : <Close /> : null}
            </TouchableOpacity>
            <Modal.Header
              alignSelf={'flex-start'}
              borderBottomWidth={0}
              backgroundColor={'transparent'}
              width={'90%'}
            >
              <Text style={styles.title} fontFamily={'body'} fontWeight={'200'} color={textColor}>
                {title}
              </Text>
              <Text
                style={styles.subTitle}
                fontFamily={'body'}
                fontWeight={'200'}
                color={subTitleColor}
                width={subTitleWidth}
              >
                {subTitle}
              </Text>
            </Modal.Header>
            <Modal.Body>
              <Content />
            </Modal.Body>
            {((showButtons && learnMore) || buttonText) && (
              <Box
                flexDirection={'row'}
                justifyContent={'space-between'}
                alignItems={'center'}
                width={'100%'}
              >
                {learnMore ? (
                  <Box
                    borderColor={'light.yellow2'}
                    borderRadius={hp(40)}
                    borderWidth={1}
                    alignItems={'center'}
                    justifyContent={'center'}
                    backgroundColor={'#00433A'}
                    style={{
                      height: hp(34),
                      width: wp(110),
                      marginLeft: wp(10),
                    }}
                  >
                    <Link onPress={learnMoreCallback}>
                      <Text
                        color={'light.yellow2'}
                        fontSize={13}
                        fontFamily={'body'}
                        fontWeight={'300'}
                      >
                        {'See FAQs'}
                      </Text>
                    </Link>
                  </Box>
                ) : (
                  <Box></Box>
                )}
                {!!buttonText && (
                  <Box alignSelf={'flex-end'} bg={'transparent'}>
                    <TouchableOpacity onPress={buttonCallback}>
                      <Box
                        bg={{
                          linearGradient: {
                            colors: buttonBackground,
                            start: [0, 0],
                            end: [1, 1],
                          },
                        }}
                        style={styles.cta}
                      >
                        <Text
                          fontSize={13}
                          fontFamily={'body'}
                          fontWeight={'300'}
                          letterSpacing={1}
                          color={buttonTextColor}
                        >
                          {showButtons ? buttonText : null}
                        </Text>
                      </Box>
                    </TouchableOpacity>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </GestureHandlerRootView>
      </Modal.Content>
    </Modal>
  );
};

export default KeeperModal;

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    alignItems: 'center',
    padding: '4%',
  },
  title: {
    fontSize: 19,
    letterSpacing: 1,
  },
  subTitle: {
    fontSize: 12,
    letterSpacing: 1,
  },
  cta: {
    borderRadius: 10,
    width: wp(110),
    height: hp(45),
    justifyContent: 'center',
    alignItems: 'center',
  },
  close: {
    position: 'absolute',
    right: 20,
    top: 20,
  },
});
