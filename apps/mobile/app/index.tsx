import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        ScaffAI Mobile
      </Text>
      <Text style={styles.subtitle}>
        足場計算・設計プラットフォーム
      </Text>
      
      <View style={styles.buttonContainer}>
        <Link href="/(tabs)" style={styles.button}>
          <Text style={styles.buttonText}>メインアプリを開く</Text>
        </Link>
        
        <Link href="/(auth)/login" style={[styles.button, styles.buttonSecondary]}>
          <Text style={styles.buttonText}>ログイン</Text>
        </Link>
        
        <Link href="/calculator/input" style={[styles.button, styles.buttonSuccess]}>
          <Text style={styles.buttonText}>計算機能テスト</Text>
        </Link>
      </View>
      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonSecondary: {
    backgroundColor: '#6b7280',
  },
  buttonSuccess: {
    backgroundColor: '#10b981',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
});