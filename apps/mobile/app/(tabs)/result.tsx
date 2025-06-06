import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ResultCard } from '../../components/ResultCard';
import { colors } from '../../constants/colors';
import { ja } from '../../constants/translations';
import { useScaffold } from '../../context/ScaffoldContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ResultScreen() {
  const { isLoading, error, calculationResult } = useScaffold();
  const router = useRouter();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>{ja.common.loading}</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={60} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => router.back()}
        >
          <Text style={styles.errorButtonText}>{ja.common.retry}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!calculationResult) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{ja.result.noResults}</Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => router.push('/(tabs)/input')}
        >
          <Text style={styles.emptyButtonText}>{ja.input.title}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>{ja.result.title}</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View>
          <ResultCard
            title={ja.result.totalSpan + " (南北)"}
            value={calculationResult.ns_total_span}
            suffix={ja.common.mm}
            delay={0}
          />
          <ResultCard
            title={ja.result.totalSpan + " (東西)"}
            value={calculationResult.ew_total_span}
            suffix={ja.common.mm}
            delay={100}
          />
          <ResultCard
            title={ja.result.spanComposition + " (南北)"}
            value={calculationResult.ns_span_structure}
            delay={200}
          />
          <ResultCard
            title={ja.result.spanComposition + " (東西)"}
            value={calculationResult.ew_span_structure}
            delay={300}
          />
          <ResultCard
            title={ja.result.endGaps + " (北)"}
            value={calculationResult.north_gap}
            delay={400}
          />
          <ResultCard
            title={ja.result.endGaps + " (南)"}
            value={calculationResult.south_gap}
            delay={500}
          />
          <ResultCard
            title={ja.result.endGaps + " (東)"}
            value={calculationResult.east_gap}
            delay={600}
          />
          <ResultCard
            title={ja.result.endGaps + " (西)"}
            value={calculationResult.west_gap}
            delay={700}
          />
          <ResultCard
            title={ja.result.numberOfLevels}
            value={calculationResult.num_stages}
            suffix={ja.common.units}
            delay={800}
          />
          <ResultCard
            title={ja.result.numberOfUnits}
            value={calculationResult.modules_count}
            suffix={ja.common.pieces}
            delay={900}
          />
          <ResultCard
            title={ja.result.jackupHeight}
            value={calculationResult.jack_up_height}
            suffix={ja.common.mm}
            delay={1000}
          />
          <ResultCard
            title={ja.result.firstLevelHeight}
            value={calculationResult.first_layer_height}
            suffix={ja.common.mm}
            delay={1100}
          />
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => {
            // TODO: 保存機能の実装
            console.log('Save result');
          }}
        >
          <Ionicons name="save" color={colors.text.primary} size={20} />
          <Text style={styles.saveButtonText}>{ja.result.saveButton}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.recalculateButton}
          onPress={() => router.push('/(tabs)/input')}
        >
          <Ionicons name="refresh" color={colors.text.primary} size={20} />
          <Text style={styles.recalculateButtonText}>{ja.result.recalculateButton}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary.main,
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  saveButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  recalculateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.main,
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  recalculateButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.dark,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.dark,
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorButton: {
    marginTop: 24,
    backgroundColor: colors.primary.main,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  errorButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.dark,
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: colors.primary.main,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});