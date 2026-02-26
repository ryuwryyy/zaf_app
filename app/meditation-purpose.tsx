/**
 * Meditation purpose screen: "目的に応じた瞑想の取り組み方".
 * Lists purposes (stress relief, focus, sleep, relaxation) with short guidance.
 */
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import type { ScaledBorderRadius, ScaledSpacing, ScaledTypography } from '@/constants/responsive';
import { useResponsive } from '@/hooks/use-responsive';
import { useThemeColor } from '@/hooks/use-theme-color';

const PURPOSES = [
  {
    id: 'stress',
    title: 'ストレス軽減',
    description:
      '日々のストレスを和らげるには、呼吸に意識を向ける瞑想がおすすめです。\n鼻呼吸でお腹をふくらませながら息を吸い、息を吐くときはお腹をへこませます。\n鼻先で感じる空気の流れを感じながら、1日5分から続けてみましょう。',
  },
  {
    id: 'focus',
    title: '集中力向上',
    description:
      '仕事や勉強の前に、短い瞑想で心を調えましょう。\n瞑想をすることで脳のアイドリング状態である「デフォルト・モード・ネットワーク（ＤＭＮ）」が休まり、集中力の助けになります。',
  },
  {
    id: 'sleep',
    title: '睡眠の質の向上',
    description:
      '寝る前に瞑想をおこなうことで、副交感神経を優位にするスイッチが働き睡眠の質の向上が期待できます。寝室に瞑想スペースを設け、寝る前のルーティンとすることで継続の助けになります。',
  },
  {
    id: 'relax',
    title: 'リラックス',
    description:
      '心と身体を休めたいときは、軽いストレッチを瞑想の前に取り入れることで心身のリラックスをよりサポートします。',
  },
];

function createStyles(spacing: ScaledSpacing, typography: ScaledTypography, scaleSize: (n: number) => number, borderRadius: ScaledBorderRadius) {
  return {
    screen: { flex: 1 as const },
    header: { flexDirection: 'row' as const, alignItems: 'center' as const },
    backButton: { flexDirection: 'row' as const, alignItems: 'center' as const, marginRight: spacing.sm },
    backLabel: { fontSize: typography.body.fontSize, fontWeight: '600' as const },
    headerTitle: { flex: 1 as const, fontSize: typography.subhead.fontSize, fontWeight: '700' as const, textAlign: 'center' as const },
    headerSpacer: { width: scaleSize(80) },
    scroll: { flex: 1 as const },
    scrollContent: { paddingTop: spacing.md },
    intro: { fontSize: typography.label.fontSize, lineHeight: scaleSize(22), marginBottom: spacing.xl },
    card: { padding: spacing.lg, borderRadius: borderRadius.md, borderWidth: 1, marginBottom: spacing.lg },
    cardTitle: { fontSize: typography.subhead.fontSize, fontWeight: '700' as const, marginBottom: spacing.sm },
    cardDescription: { fontSize: typography.body.fontSize, lineHeight: typography.body.lineHeight },
  };
}

export default function MeditationPurposeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { spacing, typography, scaleSize, borderRadius } = useResponsive();
  const styles = useMemo(() => createStyles(spacing, typography, scaleSize, borderRadius), [spacing, typography, scaleSize, borderRadius]);
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');

  return (
    <View style={[styles.screen, { backgroundColor, paddingTop: insets.top + spacing.xl }]}>
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
          accessibilityLabel="戻る">
          <IconSymbol name="chevron.left" size={scaleSize(24)} color={textColor} />
          <Text style={[styles.backLabel, { color: textColor }]}>戻る</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: textColor }]}>目的に応じた瞑想の取り組み方</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: spacing.md, paddingBottom: insets.bottom + spacing.xxl, paddingHorizontal: spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.intro, { color: textMuted }]}>
          目的に合わせた瞑想のヒントです。セッションやガイダンスとあわせてお試しください。
        </Text>
        {PURPOSES.map((p) => (
          <View key={p.id} style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}>
            <Text style={[styles.cardTitle, { color: textColor }]}>{p.title}</Text>
            <Text style={[styles.cardDescription, { color: textMuted }]}>{p.description}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

