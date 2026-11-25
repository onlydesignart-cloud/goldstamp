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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../theme/colors';
import { Business } from '../types';
import { CustomerApi } from '../services/api';
import { SearchIcon, CheckIcon } from '../components/Icons';

const CATEGORIES = ['All', 'Pickleball', 'Cafés', 'Box Cricket', 'Salons'];

interface ExploreScreenProps {
  onJoinSuccess: () => void;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({ onJoinSuccess }) => {
  const [venues, setVenues] = useState<Business[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [joinedMap, setJoinedMap] = useState<Record<string, boolean>>({
    biz_smashzone: true,
    biz_cafeartisan: true,
    biz_powerbox: true,
    biz_aurora: true,
  });

  const loadVenues = async () => {
    const list = await CustomerApi.getVenues(selectedCategory, searchQuery);
    setVenues(list);
  };

  useEffect(() => {
    loadVenues();
  }, [selectedCategory, searchQuery]);

  const handleJoin = async (venueId: string) => {
    setJoiningId(venueId);
    await CustomerApi.joinVenue(venueId);
    setJoinedMap((prev) => ({ ...prev, [venueId]: true }));
    setJoiningId(null);
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

        {/* Clean Search Bar */}
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
          {CATEGORIES.map((cat) => {
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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {venues.map((venue) => {
          const isJoined = joinedMap[venue.id];
          const primaryCampaign = venue.campaigns?.[0];

          return (
            <View key={venue.id} style={[styles.venueCard, Shadows.card]}>
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
              </View>

              {/* Campaign Highlight Box */}
              {primaryCampaign && (
                <View style={styles.campaignBox}>
                  <View style={styles.campaignTopRow}>
                    <Text style={styles.campaignBadge}>
                      {primaryCampaign.targetStamps} VISITS PASS
                    </Text>
                  </View>
                  <Text style={styles.campaignTitle}>{primaryCampaign.name}</Text>
                  <View style={styles.rewardRow}>
                    <Text style={styles.rewardLabel}>Reward</Text>
                    <Text style={styles.rewardText} numberOfLines={1}>
                      {primaryCampaign.rewardTitle}
                    </Text>
                  </View>
                </View>
              )}

              {/* Action Button */}
              <View style={styles.cardActions}>
                {isJoined ? (
                  <View style={styles.joinedPill}>
                    <CheckIcon size={12} color="#059669" strokeWidth={2.5} />
                    <Text style={styles.joinedPillText}>Joined</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.joinBtn}
                    onPress={() => handleJoin(venue.id)}
                    disabled={joiningId === venue.id}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.joinBtnText}>
                      {joiningId === venue.id ? 'Joining...' : 'Join'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
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
    borderRadius: 8,
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
  campaignBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 12,
    marginBottom: 14,
  },
  campaignTopRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  campaignBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.5,
  },
  campaignTitle: {
    fontSize: 13,
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
  rewardText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  joinedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  joinedPillText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '700',
  },
  joinBtn: {
    backgroundColor: '#000000',
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: 6,
  },
  joinBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
