import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../utils/constants';

const { width } = Dimensions.get('window');

interface WaterBottleProps {
  progress: number; // 0 to 1
  size?: number;
}

export function WaterBottle({ progress, size = 200 }: WaterBottleProps) {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animatedProgress, {
      toValue: progress,
      useNativeDriver: false,
      damping: 12,
      stiffness: 80,
    }).start();
  }, [progress]);

  useEffect(() => {
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const fillHeight = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const fillColor = animatedProgress.interpolate({
    inputRange: [0, 0.4, 0.7, 1],
    outputRange: [COLORS.foam, COLORS.sky, COLORS.wave, COLORS.ocean],
  });

  return (
    <View style={[styles.container, { width: size, height: size * 1.5 }]}>
      {/* Bottle outline */}
      <View style={[styles.bottle, { width: size * 0.65, height: size * 1.3 }]}>
        {/* Fill */}
        <Animated.View
          style={[
            styles.fill,
            {
              height: fillHeight,
              backgroundColor: fillColor,
            },
          ]}
        >
          {/* Wave top */}
          <Animated.View
            style={[
              styles.wave,
              {
                transform: [
                  {
                    translateX: waveAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -size * 0.65],
                    }),
                  },
                ],
              },
            ]}
          />
        </Animated.View>

        {/* Bubble particles */}
        {progress > 0.1 && <Bubbles size={size} progress={progress} />}
      </View>

      {/* Bottle cap */}
      <View
        style={[
          styles.cap,
          {
            width: size * 0.35,
            height: size * 0.12,
            top: 0,
          },
        ]}
      />
    </View>
  );
}

function Bubbles({ size, progress }: { size: number; progress: number }) {
  const bubbles = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    bubbles.forEach((b, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 700),
          Animated.timing(b, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(b, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  return (
    <>
      {bubbles.map((b, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bubble,
            {
              left: (i + 1) * (size * 0.12),
              opacity: b.interpolate({ inputRange: [0, 0.3, 0.7, 1], outputRange: [0, 0.7, 0.7, 0] }),
              transform: [
                {
                  translateY: b.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -size * 0.4 * progress],
                  }),
                },
              ],
              width: size * 0.06,
              height: size * 0.06,
              borderRadius: size * 0.03,
            },
          ]}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottle: {
    borderRadius: 30,
    borderWidth: 3,
    borderColor: COLORS.ocean,
    overflow: 'hidden',
    backgroundColor: COLORS.droplet,
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  fill: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    overflow: 'hidden',
  },
  wave: {
    position: 'absolute',
    top: -10,
    width: '200%',
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
  },
  cap: {
    position: 'absolute',
    backgroundColor: COLORS.ocean,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.ocean,
  },
  bubble: {
    position: 'absolute',
    bottom: '15%',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
});
