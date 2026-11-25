import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import { Colors, Shadows } from '../theme/colors';
import { LoyaltyCard } from '../types';
import { CustomerApi } from '../services/api';
import { CheckIcon, ScanIcon } from '../components/Icons';

const { width } = Dimensions.get('window');

interface WalletScreenProps {
  onNavigateToScan: () => void;
  onNavigateToExplore: () => void;
}

export const WalletScreen: React.FC<WalletScreenProps> = ({ onNavigateToScan, onNavigateToExplore }) => {
  const [cards, setCards] = useState<LoyaltyCard[]>([]);
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadCards = async () => {
    setLoading(true);
    const data = await CustomerApi.getCards();
    setCards(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCards();
  }, []);

  const activeCard = cards[selectedCardIndex] || cards[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header with Centered Brand Logo */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Horizontal Venue Cards Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsContainer}
        >
          {cards.map((c, idx) => {
            const isSelected = idx === selectedCardIndex;
            return (
              <TouchableOpacity
                key={c.id}
                onPress={() => setSelectedCardIndex(idx)}
                style={[styles.pillBtn, isSelected && styles.pillBtnActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillBtnText, isSelected && styles.pillBtnTextActive]}>
                  {c.businessName}
                </Text>
                <Text style={[styles.pillBadge, isSelected && styles.pillBadgeActive]}>
                  {c.currentStamps}/{c.targetStamps}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ACTIVE STAMP CARD (HERO) */}
        {activeCard ? (
          <View style={[styles.cardContainer, Shadows.card]}>
            {/* Obsidian Header Strip */}
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <View style={styles.logoBadge}>
                  {activeCard.businessLogo ? (
                    <Image source={{ uri: activeCard.businessLogo }} style={styles.logoBadgeImg} resizeMode="cover" />
                  ) : (
                    <Text style={styles.logoBadgeText}>
                      {activeCard.businessName.substring(0, 2).toUpperCase()}
                    </Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.venueName} numberOfLines={1}>
                    {activeCard.businessName}
                  </Text>
                  <Text style={styles.industryTag}>{activeCard.industry}</Text>
                </View>
              </View>
              <View style={styles.stampFractionBadge}>
                <Text style={styles.stampFractionText}>
                  {activeCard.currentStamps}/{activeCard.targetStamps}
                </Text>
              </View>
            </View>

            {/* Campaign & Reward Highlight */}
            <View style={styles.campaignStrip}>
              <Text style={styles.campaignName}>{activeCard.campaignName}</Text>
              <View style={styles.rewardRow}>
                <Text style={styles.rewardLabel}>Reward</Text>
                <Text style={styles.rewardTitle} numberOfLines={1}>
                  {activeCard.rewardTitle}
                </Text>
              </View>
            </View>

            {/* STAMP SLOTS MATRIX */}
            <View style={styles.slotsGrid}>
              {Array.from({ length: activeCard.targetStamps }).map((_, index) => {
                const slotNum = index + 1;
                const isStamped = slotNum <= activeCard.currentStamps;
                const isNext = slotNum === activeCard.currentStamps + 1;
                const isFinal = slotNum === activeCard.targetStamps;

                return (
                  <View
                    key={index}
                    style={[
                      styles.slot,
                      isStamped && styles.slotStamped,
                      isNext && styles.slotNext,
                      isFinal && !isStamped && styles.slotFinal,
                    ]}
                  >
                    {isStamped ? (
                      <CheckIcon size={18} color="#000000" strokeWidth={2.4} />
                    ) : isFinal ? (
                      <Text style={styles.slotPerkText}>Reward</Text>
                    ) : (
                      <Text style={[styles.slotNum, isNext && styles.slotNumNext]}>{slotNum}</Text>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Progress Bar & Footer */}
            <View style={styles.progressSection}>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Progress</Text>
                <Text style={styles.progressPercent}>
                  {Math.round((activeCard.currentStamps / activeCard.targetStamps) * 100)}%
                </Text>
              </View>
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.min(100, (activeCard.currentStamps / activeCard.targetStamps) * 100)}%` },
                  ]}
                />
              </View>

              <Text style={styles.remainingHint}>
                {activeCard.targetStamps - activeCard.currentStamps > 0
                  ? `${activeCard.targetStamps - activeCard.currentStamps} visits remaining for reward`
                  : 'Milestone reward unlocked'}
              </Text>
            </View>

            {/* Scan Action CTA */}
            <TouchableOpacity
              style={styles.scanActionBtn}
              onPress={onNavigateToScan}
              activeOpacity={0.85}
            >
              <Text style={styles.scanActionBtnText}>Check-in</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Passes Yet</Text>
            <Text style={styles.emptySubtitle}>
              Join digital stamp programs at local arenas and cafés.
            </Text>
            <TouchableOpacity style={styles.exploreBtn} onPress={onNavigateToExplore} activeOpacity={0.85}>
              <Text style={styles.exploreBtnText}>Explore</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Stats Banner */}
        <View style={styles.statsBanner}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{cards.length}</Text>
            <Text style={styles.statLabel}>Passes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {cards.reduce((sum, c) => sum + c.totalVisits, 0)}
            </Text>
            <Text style={styles.statLabel}>Visits</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>2</Text>
            <Text style={styles.statLabel}>Redeemed</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLogo: {
    height: 32,
    width: 130,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
  },
  pillsContainer: {
    gap: 8,
    paddingBottom: 14,
  },
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillBtnActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  pillBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  pillBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  pillBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  pillBadgeActive: {
    color: '#F59E0B',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  cardHeader: {
    backgroundColor: '#0F172A',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoBadgeImg: {
    width: '100%',
    height: '100%',
  },
  logoBadgeText: {
    color: '#F59E0B',
    fontWeight: '900',
    fontSize: 14,
  },
  venueName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  industryTag: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 2,
  },
  stampFractionBadge: {
    backgroundColor: '#1E293B',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  stampFractionText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '800',
  },
  campaignStrip: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  campaignName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  rewardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rewardTitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 10,
    justifyContent: 'flex-start',
  },
  slot: {
    width: (width - 32 - 32 - 40) / 5,
    height: (width - 32 - 32 - 40) / 5,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotStamped: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  slotNext: {
    borderColor: '#000000',
    borderWidth: 1.5,
    backgroundColor: '#FFFFFF',
  },
  slotFinal: {
    borderColor: '#D97706',
    borderStyle: 'dashed',
  },
  slotNum: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  slotNumNext: {
    color: '#000000',
    fontWeight: '800',
  },
  slotPerkText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
  },
  progressSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
  },
  remainingHint: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 6,
    fontWeight: '500',
  },
  scanActionBtn: {
    backgroundColor: '#000000',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  exploreBtn: {
    backgroundColor: '#000000',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  statsBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#F1F5F9',
  },
});
