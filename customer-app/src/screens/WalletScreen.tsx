import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../theme/colors';
import { LoyaltyCard } from '../types';
import { CustomerApi } from '../services/api';
import { CheckIcon, ScanIcon, CloseIcon, PiggyBankSketchIcon } from '../components/Icons';

const { width } = Dimensions.get('window');

interface WalletScreenProps {
  onNavigateToScan: () => void;
  onNavigateToExplore: () => void;
}

export const WalletScreen: React.FC<WalletScreenProps> = ({ onNavigateToScan, onNavigateToExplore }) => {
  const [cards, setCards] = useState<LoyaltyCard[]>([]);
  const [redeemedCount, setRedeemedCount] = useState(0);
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadCards = async () => {
    setLoading(true);
    const [cardData, voucherData] = await Promise.all([
      CustomerApi.getCards(),
      CustomerApi.getVouchers(),
    ]);
    setCards(cardData);
    setRedeemedCount(voucherData.filter((v) => v.status === 'REDEEMED').length);
    setLoading(false);
  };

  useEffect(() => {
    loadCards();
  }, []);

  // Group cards by businessId (Venue Grouping)
  const venueGroups: {
    businessId: string;
    businessName: string;
    businessSlug: string;
    businessLogo?: string;
    industry: string;
    cards: LoyaltyCard[];
    totalStamps: number;
    totalVisits: number;
  }[] = [];

  const venueMap: Record<string, typeof venueGroups[0]> = {};
  cards.forEach((card) => {
    if (!venueMap[card.businessId]) {
      venueMap[card.businessId] = {
        businessId: card.businessId,
        businessName: card.businessName,
        businessSlug: card.businessSlug,
        businessLogo: card.businessLogo,
        industry: card.industry,
        cards: [],
        totalStamps: 0,
        totalVisits: card.totalVisits || 0,
      };
      venueGroups.push(venueMap[card.businessId]);
    }
    venueMap[card.businessId].cards.push(card);
    venueMap[card.businessId].totalStamps += card.currentStamps;
  });

  const selectedVenueGroup = venueGroups.find((vg) => vg.businessId === selectedVenueId) || null;
  const activeVenueCards = selectedVenueGroup ? selectedVenueGroup.cards : [];
  const activeCard = activeVenueCards[selectedCardIndex] || activeVenueCards[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header */}
      <View style={styles.header}>
        {selectedVenueId ? (
          <View style={styles.subHeaderBar}>
            <TouchableOpacity
              onPress={() => setSelectedVenueId(null)}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <CloseIcon size={16} color="#0F172A" strokeWidth={2.2} />
              <Text style={styles.backBtnText}>All Venues</Text>
            </TouchableOpacity>

            <Text style={styles.subHeaderTitle} numberOfLines={1}>
              {selectedVenueGroup?.businessName}
            </Text>

            <View style={{ width: 70 }} />
          </View>
        ) : (
          <Image
            source={require('../../assets/logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* VIEW 1: INSIDE SPECIFIC VENUE WALLET */}
        {selectedVenueGroup && activeCard ? (
          <View style={styles.venueDetailWrap}>
            {/* If multiple campaigns exist in this venue, show campaign switcher tabs */}
            {activeVenueCards.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pillsContainer}
              >
                {activeVenueCards.map((c, idx) => {
                  const isSelected = idx === selectedCardIndex;
                  return (
                    <TouchableOpacity
                      key={c.id || idx}
                      onPress={() => setSelectedCardIndex(idx)}
                      style={[styles.pillBtn, isSelected && styles.pillBtnActive]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.pillCampName, isSelected && styles.pillCampNameActive]} numberOfLines={1}>
                        {c.campaignName}
                      </Text>
                      <Text style={[styles.pillBadge, isSelected && styles.pillBadgeActive]}>
                        {c.currentStamps}/{c.targetStamps}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {/* ACTIVE STAMP CARD (HERO) */}
            <View style={[styles.cardContainer, Shadows.card]}>
              {/* Campaign Promo Banner Header (if banner exists) */}
              {activeCard.bannerImage ? (
                <View style={styles.cardBannerHeader}>
                  <Image
                    source={{ uri: activeCard.bannerImage }}
                    style={styles.cardBannerImg}
                    resizeMode="cover"
                  />
                </View>
              ) : null}

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
                  <View style={{ flex: 1, paddingRight: 4 }}>
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
                <Text style={styles.scanActionBtnText}>Scan Counter QR</Text>
              </TouchableOpacity>
            </View>

            {/* Link to see more offers in this venue */}
            <TouchableOpacity
              style={styles.moreOffersLink}
              onPress={onNavigateToExplore}
              activeOpacity={0.7}
            >
              <Text style={styles.moreOffersLinkText}>
                + View all offers at {selectedVenueGroup.businessName} →
              </Text>
            </TouchableOpacity>
          </View>
        ) : venueGroups.length > 0 ? (
          /* VIEW 2: VENUES CARDS LIST (User clicks a venue card to enter) */
          <View style={styles.venuesListWrap}>
            <View style={styles.sectionTitleRow}>
              <View>
                <Text style={styles.mainTitle}>My Loyalty Venues</Text>
                <Text style={styles.mainSubtitle}>
                  Tap any venue to open your stamp cards & rewards
                </Text>
              </View>
              <View style={styles.venuesCountBadge}>
                <Text style={styles.venuesCountText}>
                  {venueGroups.length} Venue{venueGroups.length > 1 ? 's' : ''}
                </Text>
              </View>
            </View>

            {venueGroups.map((vg) => (
              <TouchableOpacity
                key={vg.businessId}
                style={[styles.venueGroupCard, Shadows.card]}
                activeOpacity={0.85}
                onPress={() => {
                  setSelectedVenueId(vg.businessId);
                  setSelectedCardIndex(0);
                }}
              >
                <View style={styles.vgHeader}>
                  <View style={styles.vgLogoBadge}>
                    {vg.businessLogo ? (
                      <Image source={{ uri: vg.businessLogo }} style={styles.vgLogoImg} resizeMode="cover" />
                    ) : (
                      <Text style={styles.vgLogoText}>
                        {vg.businessName.substring(0, 2).toUpperCase()}
                      </Text>
                    )}
                  </View>

                  <View style={{ flex: 1, paddingRight: 6 }}>
                    <Text style={styles.vgName} numberOfLines={1}>
                      {vg.businessName}
                    </Text>
                    <Text style={styles.vgIndustry}>{vg.industry}</Text>
                  </View>

                  <View style={styles.vgPassesCountBadge}>
                    <Text style={styles.vgPassesCountText}>
                      {vg.cards.length} {vg.cards.length === 1 ? 'Pass' : 'Passes'}
                    </Text>
                  </View>
                </View>

                {/* Joined Campaigns Preview Badges */}
                <View style={styles.vgCampaignsRow}>
                  {vg.cards.map((c) => (
                    <View key={c.id} style={styles.vgCampPill}>
                      <Text style={styles.vgCampPillTitle} numberOfLines={1}>
                        {c.campaignName}
                      </Text>
                      <Text style={styles.vgCampPillStamps}>
                        {c.currentStamps}/{c.targetStamps}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Bottom Action Footer */}
                <View style={styles.vgFooter}>
                  <Text style={styles.vgFooterHint}>
                    {vg.totalStamps} stamps collected
                  </Text>
                  <Text style={styles.vgOpenLink}>
                    Open Venue Wallet →
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          /* EMPTY WALLET STATE */
          <View style={[styles.emptyContainer, Shadows.card]}>
            <PiggyBankSketchIcon size={80} color="#94A3B8" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>Your Wallet is Empty</Text>
            <Text style={styles.emptySubtitle}>
              You haven't joined any loyalty campaigns yet. Explore participating venues and tap "Join Campaign" to add your stamp cards here!
            </Text>
            <TouchableOpacity style={styles.exploreBtn} onPress={onNavigateToExplore} activeOpacity={0.85}>
              <Text style={styles.exploreBtnText}>Explore Venues & Join Offers</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Stats Banner */}
        <View style={styles.statsBanner}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{cards.length}</Text>
            <Text style={styles.statLabel}>Active Passes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {cards.reduce((sum, c) => sum + c.totalVisits, 0)}
            </Text>
            <Text style={styles.statLabel}>Total Visits</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{redeemedCount}</Text>
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
    paddingHorizontal: 16,
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
  subHeaderBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  subHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    maxWidth: 180,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
  },

  // Venue Grouping List Styles
  venuesListWrap: {
    gap: 12,
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  mainTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  mainSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  venuesCountBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  venuesCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  venueGroupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  vgHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  vgLogoBadge: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  vgLogoImg: {
    width: '100%',
    height: '100%',
  },
  vgLogoText: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: '800',
  },
  vgName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  vgIndustry: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  vgPassesCountBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  vgPassesCountText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '700',
  },
  vgCampaignsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
    paddingTop: 4,
  },
  vgCampPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  vgCampPillTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    maxWidth: 130,
  },
  vgCampPillStamps: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  vgFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  vgFooterHint: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  vgOpenLink: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0284C7',
  },

  // Venue Detail Card View
  venueDetailWrap: {
    marginBottom: 16,
  },
  pillsContainer: {
    gap: 8,
    paddingBottom: 12,
  },
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillBtnActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  pillCampName: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '700',
  },
  pillCampNameActive: {
    color: '#FFFFFF',
  },
  pillBadge: {
    fontSize: 10,
    fontWeight: '800',
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
    marginBottom: 12,
  },
  cardBannerHeader: {
    height: 125,
    width: '100%',
    backgroundColor: '#F1F5F9',
  },
  cardBannerImg: {
    width: '100%',
    height: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#0F172A',
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
    fontSize: 15,
    fontWeight: '800',
  },
  venueName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  industryTag: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  stampFractionBadge: {
    backgroundColor: '#0F172A',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  stampFractionText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  campaignStrip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  campaignName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rewardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1,
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
    gap: 12,
    justifyContent: 'center',
  },
  slot: {
    width: 52,
    height: 52,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotStamped: {
    backgroundColor: '#F59E0B',
    borderColor: '#D97706',
  },
  slotNext: {
    borderColor: '#0F172A',
    borderStyle: 'dashed',
    backgroundColor: '#FFFFFF',
  },
  slotFinal: {
    borderColor: '#D97706',
    backgroundColor: '#FFFBEB',
  },
  slotNum: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
  slotNumNext: {
    color: '#0F172A',
  },
  slotPerkText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
    textTransform: 'uppercase',
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
    fontWeight: '700',
    color: '#0F172A',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 3,
  },
  remainingHint: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  scanActionBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  scanActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  moreOffersLink: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  moreOffersLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
  },

  // Empty State Styles
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  exploreBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 8,
    marginTop: 4,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  statsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#F1F5F9',
  },
});
