import { Dimensions, Platform, StatusBar, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { ScreenWrapperProps } from '@/types'
import { colors } from '@/constants/Theme';
//as in ios there is a notch just to have below notch we use ScrenWwrapperProp
const { height } = Dimensions.get("window");
//this will give me the height of the device that i am using

const ScreenWrapper = ({ style, children }: ScreenWrapperProps) => {
    let paddingTop = Platform.OS == "ios" ? height * 0.06 : 20; //0.06% for ios and android 5px
  return (
      <View style={[
          {
              paddingTop,
              flex: 1,
              backgroundColor: "#ffffff"
          },style 
                
      ]}> 
          {/* statusbar is the wifi charge wala bar */}
          <StatusBar barStyle={Platform.OS =="ios" ?("dark-content"):("light-content") }/>
          {children}
    </View>
  )
}

export default ScreenWrapper

const styles = StyleSheet.create({})