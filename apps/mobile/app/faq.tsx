import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors as baseColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { AppHeader } from '../components/AppHeader';
import { Stack } from 'expo-router';

// FAQ データ
const faqData = [
  {
    id: 1,
    question: '計算結果が表示されません',
    answer: '以下をご確認ください：\n\n• 建物の幅（南北・東西）が正しく入力されているか\n• 数値が0より大きいか\n• ネットワーク接続が安定しているか\n\n問題が続く場合は、アプリを再起動してお試しください。',
    category: 'calculation',
  },
  {
    id: 2,
    question: '保存した履歴が見つかりません',
    answer: 'ローカル保存とクラウド保存を確認してください：\n\n• 履歴画面で「ローカル」「クラウド」を切り替えて確認\n• ローカル保存：端末内に保存（オフラインでアクセス可能）\n• クラウド保存：ログインが必要（端末間で同期）\n\nクラウド保存を利用するにはログインが必要です。',
    category: 'save',
  },
  {
    id: 3,
    question: 'ローカル保存とクラウド保存の違いは？',
    answer: '**ローカル保存**\n• 端末内に保存\n• ログイン不要\n• オフラインでアクセス可能\n• 端末を変えるとデータは移行されない\n\n**クラウド保存**\n• サーバーに保存\n• ログインが必要\n• 複数端末でデータ同期\n• インターネット接続が必要',
    category: 'save',
  },
  {
    id: 4,
    question: '入力項目の意味を教えてください',
    answer: '**建物幅**：足場を設置する建物のサイズ\n**軒の出**：屋根の軒が建物から出ている距離\n**敷地境界線**：隣地との境界までの距離\n**基準高さ**：足場の基準となる高さ\n**屋根形状**：建物の屋根の形（フラット/勾配軒/陸屋根）\n\n詳細は使い方ガイドもご参照ください。',
    category: 'input',
  },
  {
    id: 5,
    question: 'エラーが表示されました',
    answer: 'エラーの種類に応じて対処してください：\n\n**計算エラー**\n• 入力値を確認（負の数、異常に大きな数値など）\n• アプリを再起動\n\n**保存エラー**\n• 端末の容量を確認\n• ネットワーク接続を確認（クラウド保存の場合）\n\n**ログインエラー**\n• インターネット接続を確認\n• ログイン情報を再確認',
    category: 'error',
  },
  {
    id: 6,
    question: 'データを削除したいです',
    answer: '**個別削除**\n履歴画面で各項目の削除ボタンをタップ\n\n**一括削除**\n設定 > データ管理 > 履歴をクリア\n\n⚠️ 削除したデータは復元できませんのでご注意ください。重要なデータは事前にバックアップを取ることをお勧めします。',
    category: 'data',
  },
  {
    id: 7,
    question: 'アプリが動作しません・重いです',
    answer: '以下の対処をお試しください：\n\n**基本対処**\n• アプリを完全に終了して再起動\n• 端末を再起動\n• アプリを最新版に更新\n\n**端末環境**\n• 端末の容量に余裕があるか確認\n• 他のアプリを終了\n• Wi-Fi環境で利用\n\n改善しない場合は端末の性能やOSバージョンをご確認ください。',
    category: 'performance',
  },
  {
    id: 8,
    question: 'ログインできません',
    answer: 'ログインに関するトラブル：\n\n**確認事項**\n• インターネット接続が安定しているか\n• メールアドレス・パスワードが正しいか\n• キーボードの言語設定（英数字入力）\n\n**対処方法**\n• パスワードリセットを試す\n• 時間をおいて再度試す\n• 別のネットワーク環境で試す\n\nそれでも解決しない場合は、アカウント作成からやり直してください。',
    category: 'auth',
  },
];

// カテゴリアイコンのマッピング
const categoryIcons: Record<string, string> = {
  calculation: 'calculator',
  save: 'save',
  input: 'create',
  error: 'warning',
  data: 'trash',
  performance: 'speedometer',
  auth: 'person',
};

// カテゴリカラーのマッピング
const categoryColors: Record<string, string> = {
  calculation: baseColors.primary.main,
  save: baseColors.secondary.main,
  input: baseColors.accent.orange,
  error: baseColors.error,
  data: baseColors.warning,
  performance: baseColors.success,
  auth: baseColors.accent.purple,
};

interface FAQItemProps {
  item: typeof faqData[0];
  isExpanded: boolean;
  onPress: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ item, isExpanded, onPress }) => {
  const { colors } = useTheme();
  const [animatedHeight] = useState(new Animated.Value(0));
  
  React.useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isExpanded]);

  return (
    <View style={[styles.faqItem, { backgroundColor: colors.background.card }]}>
      <TouchableOpacity style={styles.questionContainer} onPress={onPress}>
        <View style={styles.questionHeader}>
          <View style={[
            styles.categoryIcon, 
            { backgroundColor: `${categoryColors[item.category]}15` }
          ]}>
            <Ionicons
              name={categoryIcons[item.category] as any}
              size={20}
              color={categoryColors[item.category]}
            />
          </View>
          <Text style={[styles.questionText, { color: colors.text.primary }]}>
            {item.question}
          </Text>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.text.secondary}
          />
        </View>
      </TouchableOpacity>
      
      <Animated.View
        style={[
          styles.answerContainer,
          {
            opacity: animatedHeight,
            maxHeight: animatedHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 500],
            }),
          },
        ]}
      >
        <View style={[styles.answerContent, { borderTopColor: colors.border.main }]}>
          <Text style={[styles.answerText, { color: colors.text.secondary }]}>
            {item.answer}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

export default function FAQScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  // Expo Routerの自動ヘッダーを非表示
  React.useLayoutEffect(() => {
    // この画面では自動ヘッダーを非表示にする
  }, []);

  const toggleItem = (id: number) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <AppHeader 
          title="よくある質問" 
          showBackButton 
          onBackPress={() => router.back()}
        />
        <StatusBar style={isDark ? 'light' : 'dark'} />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            よくある質問
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            問題の解決方法を確認できます。質問をタップして回答を表示してください。
          </Text>
        </View>

        {/* FAQ リスト */}
        <View style={styles.faqList}>
          {faqData.map((item) => (
            <FAQItem
              key={item.id}
              item={item}
              isExpanded={expandedItems.includes(item.id)}
              onPress={() => toggleItem(item.id)}
            />
          ))}
        </View>

        {/* フッター */}
        <View style={[styles.footer, { backgroundColor: colors.background.secondary }]}>
          <Ionicons name="help-circle" size={24} color={baseColors.primary.main} />
          <Text style={[styles.footerText, { color: colors.text.secondary }]}>
            解決しない問題がある場合は、設定画面から使い方ガイドをご確認いただくか、アプリを再起動してお試しください。
          </Text>
        </View>
      </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  
  // ヘッダー
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  
  // FAQ リスト
  faqList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  faqItem: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  questionContainer: {
    padding: 16,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  answerContainer: {
    overflow: 'hidden',
  },
  answerContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
  },
  answerText: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
  
  // フッター
  footer: {
    margin: 16,
    marginTop: 32,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  footerText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});