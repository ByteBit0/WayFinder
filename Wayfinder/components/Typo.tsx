// as we are using dark theme the text should be white in most of the cases hence creating a component will render everything to white text
import { StyleSheet, Text, TextStyle, View } from 'react-native'
import React from 'react'
import { colors } from '@/constants/Theme'
import { TypoProps } from '@/types'
import { verticalScale } from '@/utils/Styling'

const Typo = ({
    size,
    color = colors.text,
    fontWeight = "400",
    children,
    style,
    textProps ={},
}: TypoProps) => {
  const textStyle: TextStyle = {
    fontSize: size ? verticalScale(size) : verticalScale(18),
    color,
    fontWeight,
   
  }
  return (
    <Text style={[textStyle, style]}{...textProps}>
      {children}
    </Text>
  )
}

export default Typo

const styles = StyleSheet.create({})