import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';
import { ja } from '../../constants/translations';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView}>
        <Animated.View
          entering={FadeIn.duration(600)}
          style={styles.container}
        >
          <View style={styles.content}>
            <Text style={styles.title}>{ja.appName}</Text>
            <Text style={styles.version}>Ver.1.0</Text>
            <Text style={styles.description}>{ja.home.description}</Text>
            
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('/(tabs)/input')}
            >
              <Text style={styles.buttonText}>{ja.home.startButton}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  version: {
    fontSize: 18,
    color: colors.text.secondary,
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  button: {
    backgroundColor: colors.primary.main,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
});