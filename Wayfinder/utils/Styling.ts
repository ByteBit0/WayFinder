import { Dimensions, PixelRatio } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const [shortDimension, longDimension] = (SCREEN_WIDTH < SCREEN_HEIGHT) ? [SCREEN_WIDTH, SCREEN_HEIGHT] : [SCREEN_HEIGHT, SCREEN_WIDTH];

const guideLineBaseWidth = 375;
const guideLineBaseHeight = 812;

export const scale = (size: number) =>
    Math.round(
        PixelRatio.roundToNearestPixel(
            (shortDimension / guideLineBaseWidth) * (size as number)
        ),
    );

export const verticalScale = (size: number) =>
    Math.round(
        PixelRatio.roundToNearestPixel(
            (longDimension / guideLineBaseHeight) * (size as number)
        ),
    );
    // this is only for the view purpose scaling them will give us good UI giving respect to every phone screen type