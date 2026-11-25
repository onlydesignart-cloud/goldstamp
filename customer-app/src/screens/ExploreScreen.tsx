import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../theme/colors';
import { Business, Campaign } from '../types';
import { CustomerApi } from '../services/api';
import { SearchIcon, CheckIcon, CloseIcon, PiggyBankSketchIcon } from '../components/Icons';

interface ExploreScreenProps {
  onJoinSuccess: () => void;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({ onJoinSuccess }) => {
  const [venues, setVenues] = useState<Business[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [joiningCampId, setJoiningCampId] = useState<string | null>(null);
  const [joinedCampaignMap, setJoinedCampaignMap] = useState<Record<string, boolean>>({});
  const [selectedVenue, setSelectedVenue] = useState<Business | null>(null);

  const loadVenues = async () => {
    const list = await CustomerApi.getVenues(selectedCategory, searchQuery);
    setVenues(list);

    const userCards = await CustomerApi.getCards();
    const map: Record<string, boolean> = {};
    userCards.forEach((c) => {
      if (c.campaignId) map[c.campaignId] = true;
    });
    setJoinedCampaignMap(map);
  };

  useEffect(() => {
    loadVenues();
  }, [selectedCategory, searchQuery]);

  const categories = ['All', ...Array.from(new Set(venues.map((v) => v.industry).filter(Boolean)))];

  const handleJoinCampaign = async (businessId: string, campaignId: string) => {
    setJoiningCampId(campaignId);
    await CustomerApi.joinCampaign(businessId, campaignId);
    setJoinedCampaignMap((prev) => ({ ...prev, [campaignId]: true }));
    setJoiningCampId(null);
    onJoinSuccess();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.centerLogoContainer}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <SearchIcon size={16} color="#64748B" strokeWidth={2} />
          <TextInput
            placeholder="Search venue or location..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryPills}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.catBtn, isSelected && styles.catBtnActive]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.7}
              >
                <Text style={[styles.catBtnText, isSelected && styles.catBtnTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Venue List */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {venues.length === 0 ? (
          <View style={styles.emptyContainer}>
            <PiggyBankSketchIcon size={72} color="#94A3B8" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No Venues Available</Text>
            <Text style={styles.emptySub}>
              New participating merchant venues will automatically appear here once registered.
            </Text>
          </View>
        ) : (
          venues.map((venue) => {
            const campaigns = venue.campaigns || [];
            const primaryCampaign = campaigns[0];
            const isPrimaryJoined = primaryCampaign ? !!joinedCampaignMap[primaryCampaign.id] : false;
            const anyJoinedInVenue = campaigns.some((c) => !!joinedCampaignMap[c.id]);

            return (
              <TouchableOpacity
                key={venue.id}
                style={[styles.venueCard, Shadows.card]}
                activeOpacity={0.9}
                onPress={() => setSelectedVenue(venue)}
              >
                {/* Optional Venue Cover Header if available */}
                {venue.coverImage ? (
                  <View style={styles.cardCoverContainer}>
                    <Image source={{ uri: venue.coverImage }} style={styles.cardCoverImg} resizeMode="cover" />
                  </View>
                ) : null}

                <View style={styles.cardHeader}>
                  <View style={styles.venueLogo}>
                    {venue.logo ? (
                      <Image source={{ uri: venue.logo }} style={styles.venueLogoImg} resizeMode="cover" />
                    ) : (
                      <Text style={styles.venueLogoText}>
                        {venue.name.substring(0, 2).toUpperCase()}
                      </Text>
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.venueName} numberOfLines={1}>
                      {venue.name}
                    </Text>
                    <View style={styles.venueMetaRow}>
                      <Text style={styles.metaIndustry}>{venue.industry}</Text>
                      {venue.city && (
                        <>
                          <Text style={styles.metaDot}>•</Text>
                          <Text style={styles.metaCity}>{venue.city}</Text>
                        </>
                      )}
                    </View>
                  </View>

                  {/* Single Campaign Quick Action (if only 1 campaign) */}
                  {campaigns.length === 1 && primaryCampaign ? (
                    isPrimaryJoined ? (
                      <View style={styles.joinedPill}>
                        <CheckIcon size={12} color="#059669" strokeWidth={2.5} />
                        <Text style={styles.joinedPillText}>In Wallet</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.quickJoinBtn}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleJoinCampaign(venue.id, primaryCampaign.id);
                        }}
                        disabled={joiningCampId === primaryCampaign.id}
                      >
                        <Text style={styles.quickJoinBtnText}>
                          {joiningCampId === primaryCampaign.id ? '...' : '+ Join'}
                        </Text>
                      </TouchableOpacity>
                    )
                  ) : campaigns.length > 1 ? (
                    <View style={styles.multiOffersPill}>
                      <Text style={styles.multiOffersPillText}>
                        {campaigns.length} Offers
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Primary Campaign Highlight Box */}
                {primaryCampaign ? (
                  <View style={styles.campaignBox}>
                    {primaryCampaign.bannerImage ? (
                      <View style={styles.campaignCardBannerBox}>
                        <Image
                          source={{ uri: primaryCampaign.bannerImage }}
                          style={styles.campaignCardBannerImg}
                          resizeMode="cover"
                        />
                      </View>
                    ) : null}

                    <View style={styles.campaignTopRow}>
                      <Text style={styles.campaignBadge}>
                        {primaryCampaign.targetStamps} VISITS PASS
                      </Text>
                      {campaigns.length > 1 && (
                        <Text style={styles.multipleOffersBadge}>
                          +{campaigns.length - 1} more offer{campaigns.length > 2 ? 's' : ''}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.campaignTitle}>{primaryCampaign.name}</Text>
                    <View style={styles.rewardRow}>
                      <Text style={styles.rewardLabel}>Reward</Text>
                      <Text style={styles.rewardText} numberOfLines={1}>
                        {primaryCampaign.rewardTitle}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.noOffersNoticeBox}>
                    <Text style={styles.noOffersNoticeText}>
                      No campaign offers active • Tap to view venue details
                    </Text>
                  </View>
                )}

                {/* View Details Footer Link */}
                <View style={styles.viewDetailsRow}>
                  <Text style={styles.viewDetailsText}>
                    {campaigns.length > 1
                      ? `View all ${campaigns.length} campaign offers & join →`
                      : 'View venue details →'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* VENUE DETAIL VIEW MODAL */}
      <Modal
        visible={!!selectedVenue}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedVenue(null)}
      >
        <SafeAreaView style={styles.detailModalSafe}>
          <StatusBar barStyle="dark-content" />

          {/* Modal Header */}
          <View style={styles.modalHeaderBar}>
            <TouchableOpacity
              onPress={() => setSelectedVenue(null)}
              style={styles.modalCloseBtn}
              activeOpacity={0.7}
            >
              <CloseIcon size={18} color="#0F172A" strokeWidth={2} />
              <Text style={styles.modalCloseText}>Back</Text>
            </TouchableOpacity>

            <Text style={styles.modalHeaderTitle} numberOfLines={1}>
              {selectedVenue?.name}
            </Text>

            <View style={{ width: 60 }} />
          </View>

          {selectedVenue && (
            <ScrollView
              contentContainerStyle={styles.detailScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Venue Hero Cover */}
              {selectedVenue.coverImage ? (
                <View style={styles.detailCoverWrap}>
                  <Image
                    source={{ uri: selectedVenue.coverImage }}
                    style={styles.detailCoverImg}
                    resizeMode="cover"
                  />
                  <View style={styles.detailCoverOverlay} />
                </View>
              ) : null}

              {/* Venue Info Header Card */}
              <View style={[styles.detailVenueCard, Shadows.card]}>
                <View style={styles.detailLogoRow}>
                  <View style={styles.detailVenueLogo}>
                    {selectedVenue.logo ? (
                      <Image
                        source={{ uri: selectedVenue.logo }}
                        style={styles.venueLogoImg}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={styles.detailLogoText}>
                        {selectedVenue.name.substring(0, 2).toUpperCase()}
                      </Text>
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailVenueName}>{selectedVenue.name}</Text>
                    <View style={styles.venueMetaRow}>
                      <Text style={styles.detailIndustryBadge}>{selectedVenue.industry}</Text>
                      {selectedVenue.city && (
                        <Text style={styles.detailCityText}>{selectedVenue.city}</Text>
                      )}
                    </View>
                  </View>
                </View>

                {selectedVenue.address && (
                  <Text style={styles.detailAddressText}>{selectedVenue.address}</Text>
                )}
              </View>

              {/* OFFERS SECTION */}
              <View style={styles.detailSectionHeader}>
                <div>
                  <Text style={styles.detailSectionTitle}>Select Campaign to Join</Text>
                  <Text style={styles.detailSectionSubtitle}>
                    Join the specific campaign you want to add to your Wallet
                  </Text>
                </div>
                <View style={styles.detailOffersCountBadge}>
                  <Text style={styles.detailOffersCountText}>
                    {selectedVenue.campaigns?.length || 0} Available
                  </Text>
                </View>
              </View>

              {/* List of Multiple Campaigns with Individual Join Buttons */}
              {selectedVenue.campaigns && selectedVenue.campaigns.length > 0 ? (
                <View style={styles.campaignsListWrap}>
                  {selectedVenue.campaigns.map((camp, index) => {
                    const isJoined = !!joinedCampaignMap[camp.id];

                    return (
                      <View key={camp.id || index} style={[styles.detailCampaignCard, Shadows.card]}>
                        {/* Campaign Promo Banner */}
                        {camp.bannerImage ? (
                          <View style={styles.detailCampBannerWrap}>
                            <Image
                              source={{ uri: camp.bannerImage }}
                              style={styles.detailCampBannerImg}
                              resizeMode="cover"
                            />
                          </View>
                        ) : null}

                        <View style={styles.detailCampBody}>
                          {/* Target badge & Type */}
                          <View style={styles.campBadgeRow}>
                            <View style={styles.campPassBadge}>
                              <Text style={styles.campPassBadgeText}>
                                {camp.targetStamps} STAMPS PASS
                              </Text>
                            </View>
                            <Text style={styles.campTypeLabel}>
                              {camp.type === 'VISIT' ? 'Visit Program' : 'Stamp Card'}
                            </Text>
                          </View>

                          {/* Title & Description */}
                          <Text style={styles.campCardTitle}>{camp.name}</Text>
                          {camp.description ? (
                            <Text style={styles.campCardDesc}>{camp.description}</Text>
                          ) : null}

                          {/* Reward Highlight Box */}
                          <View style={styles.campRewardHighlight}>
                            <View style={styles.campRewardIconBox}>
                              <Text style={{ fontSize: 14 }}>🎁</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.campRewardHighlightLabel}>Milestone Reward</Text>
                              <Text style={styles.campRewardHighlightVal}>{camp.rewardTitle}</Text>
                            </View>
                          </View>

                          {/* Individual Campaign Join CTA */}
                          <View style={styles.campJoinActionWrap}>
                            {isJoined ? (
                              <View style={styles.campJoinedPill}>
                                <CheckIcon size={14} color="#059669" strokeWidth={2.5} />
                                <Text style={styles.campJoinedPillText}>Added to Wallet</Text>
                              </View>
                            ) : (
                              <TouchableOpacity
                                style={styles.campJoinBtn}
                                onPress={() => handleJoinCampaign(selectedVenue.id, camp.id)}
                                disabled={joiningCampId === camp.id}
                                activeOpacity={0.85}
                              >
                                <Text style={styles.campJoinBtnText}>
                                  {joiningCampId === camp.id
                                    ? 'Adding to Wallet...'
                                    : '+ Join Campaign & Add to Wallet'}
                                </Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                /* EMPTY STATE: "No Campaign Offers Yet" with cute Piggy sketch icon */
                <View style={styles.noCampaignEmptyBox}>
                  <PiggyBankSketchIcon size={80} color="#94A3B8" strokeWidth={1.6} />
                  <Text style={styles.noCampaignTitle}>No Campaign Offers Yet</Text>
                  <Text style={styles.noCampaignSub}>
                    This venue hasn't launched any loyalty offers yet. Check back soon for exciting rewards and stamp cards!
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  centerLogoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  headerLogo: {
    height: 32,
    width: 130,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 0,
  },
  categoryPills: {
    gap: 8,
    paddingBottom: 4,
  },
  catBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catBtnActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  catBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  catBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  venueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    overflow: 'hidden',
  },
  cardCoverContainer: {
    height: 100,
    marginHorizontal: -16,
    marginTop: -16,
    marginBottom: 12,
    backgroundColor: '#F1F5F9',
  },
  cardCoverImg: {
    width: '100%',
    height: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  venueLogo: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  venueLogoImg: {
    width: '100%',
    height: '100%',
  },
  venueLogoText: {
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
  venueMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  metaIndustry: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  metaDot: {
    color: '#CBD5E1',
    fontSize: 10,
  },
  metaCity: {
    fontSize: 12,
    color: '#94A3B8',
  },
  quickJoinBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  quickJoinBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  joinedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  joinedPillText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '700',
  },
  multiOffersPill: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  multiOffersPillText: {
    color: '#1D4ED8',
    fontSize: 10,
    fontWeight: '700',
  },
  campaignBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 12,
    marginBottom: 10,
  },
  campaignCardBannerBox: {
    height: 90,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
    backgroundColor: '#E2E8F0',
  },
  campaignCardBannerImg: {
    width: '100%',
    height: '100%',
  },
  campaignTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  campaignBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.5,
  },
  multipleOffersBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284C7',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  campaignTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
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
  rewardText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  noOffersNoticeBox: {
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  noOffersNoticeText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  viewDetailsRow: {
    alignItems: 'flex-end',
    paddingTop: 4,
  },
  viewDetailsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  emptyContainer: {
    paddingVertical: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 8,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Modal Detailed View Styles
  detailModalSafe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalCloseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  modalCloseText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    maxWidth: 200,
  },
  detailScrollContent: {
    paddingBottom: 40,
  },
  detailCoverWrap: {
    height: 140,
    width: '100%',
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  detailCoverImg: {
    width: '100%',
    height: '100%',
  },
  detailCoverOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  detailVenueCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: -20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  detailLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  detailVenueLogo: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  detailLogoText: {
    color: '#F59E0B',
    fontSize: 18,
    fontWeight: '800',
  },
  detailVenueName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  detailIndustryBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  detailCityText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  detailAddressText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  detailSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 12,
  },
  detailSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  detailSectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  detailOffersCountBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  detailOffersCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  campaignsListWrap: {
    paddingHorizontal: 16,
    gap: 14,
  },
  detailCampaignCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  detailCampBannerWrap: {
    height: 130,
    width: '100%',
    backgroundColor: '#F1F5F9',
  },
  detailCampBannerImg: {
    width: '100%',
    height: '100%',
  },
  detailCampBody: {
    padding: 16,
  },
  campBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  campPassBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 4,
  },
  campPassBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.5,
  },
  campTypeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  campCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  campCardDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 10,
  },
  campRewardHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  campRewardIconBox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  campRewardHighlightLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
    textTransform: 'uppercase',
  },
  campRewardHighlightVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  campJoinActionWrap: {
    paddingTop: 2,
  },
  campJoinedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  campJoinedPillText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '700',
  },
  campJoinBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  campJoinBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Empty state in Detail Modal
  noCampaignEmptyBox: {
    margin: 20,
    padding: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  noCampaignTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 6,
  },
  noCampaignSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
});
