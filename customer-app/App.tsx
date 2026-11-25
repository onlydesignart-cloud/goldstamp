import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from './src/theme/colors';
import { WalletScreen } from './src/screens/WalletScreen';
import { ScanScreen } from './src/screens/ScanScreen';
import { VouchersScreen } from './src/screens/VouchersScreen';
import { ExploreScreen } from './src/screens/ExploreScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { CustomerApi } from './src/services/api';
import {
  WalletIcon,
  RewardsIcon,
  ScanIcon,
  VenuesIcon,
  ProfileIcon,
} from './src/components/Icons';

type Tab = 'WALLET' | 'VOUCHERS' | 'EXPLORE' | 'PROFILE';

export default function App() {
  const [user, setUser] = useState<{ name: string; phone: string; email?: string; whatsapp?: string } | null>(null);
  const [currentTab, setCurrentTab] = useState<Tab>('WALLET');
  const [isScanning, setIsScanning] = useState(false);

  // If not authenticated, show Customer Mobile Auth Screen
  if (!user) {
    return (
      <SafeAreaProvider>
        <AuthScreen
          onLoginSuccess={(loggedInUser) => {
            CustomerApi.setCurrentCustomer(loggedInUser);
            setUser(loggedInUser);
            setCurrentTab('WALLET');
          }}
        />
      </SafeAreaProvider>
    );
  }

  // If active scanner mode, show full-screen camera
  if (isScanning) {
    return (
      <SafeAreaProvider>
        <ScanScreen
          onClose={() => setIsScanning(false)}
          onScanComplete={() => {
            setIsScanning(false);
            setCurrentTab('WALLET');
          }}
          onNavigateToRewards={() => {
            setIsScanning(false);
            setCurrentTab('VOUCHERS');
          }}
        />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {/* Main Screen Body */}
        <View style={styles.content}>
          {currentTab === 'WALLET' && (
            <WalletScreen
              onNavigateToScan={() => setIsScanning(true)}
              onNavigateToExplore={() => setCurrentTab('EXPLORE')}
            />
          )}
          {currentTab === 'VOUCHERS' && <VouchersScreen />}
          {currentTab === 'EXPLORE' && (
            <ExploreScreen onJoinSuccess={() => setCurrentTab('WALLET')} />
          )}
          {currentTab === 'PROFILE' && (
            <ProfileScreen
              user={user}
              onProfileUpdate={(updated) => setUser(updated)}
              onSignOut={() => setUser(null)}
            />
          )}
        </View>

        {/* Clean Monochrome Bottom Navigation Bar */}
        <View style={styles.bottomBar}>
          {/* Wallet Tab */}
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setCurrentTab('WALLET')}
            activeOpacity={0.7}
          >
            <WalletIcon
              size={21}
              color={currentTab === 'WALLET' ? '#000000' : '#94A3B8'}
              strokeWidth={currentTab === 'WALLET' ? 2.2 : 1.7}
            />
            <Text style={[styles.tabLabel, currentTab === 'WALLET' && styles.tabLabelActive]}>
              Wallet
            </Text>
          </TouchableOpacity>

          {/* Vouchers Tab */}
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setCurrentTab('VOUCHERS')}
            activeOpacity={0.7}
          >
            <RewardsIcon
              size={21}
              color={currentTab === 'VOUCHERS' ? '#000000' : '#94A3B8'}
              strokeWidth={currentTab === 'VOUCHERS' ? 2.2 : 1.7}
            />
            <Text style={[styles.tabLabel, currentTab === 'VOUCHERS' && styles.tabLabelActive]}>
              Rewards
            </Text>
          </TouchableOpacity>

          {/* Center Minimalist Scan Button */}
          <TouchableOpacity
            style={styles.scanFloatingBtn}
            onPress={() => setIsScanning(true)}
            activeOpacity={0.85}
          >
            <ScanIcon size={24} color="#FFFFFF" strokeWidth={2.2} />
          </TouchableOpacity>

          {/* Explore Tab */}
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setCurrentTab('EXPLORE')}
            activeOpacity={0.7}
          >
            <VenuesIcon
              size={21}
              color={currentTab === 'EXPLORE' ? '#000000' : '#94A3B8'}
              strokeWidth={currentTab === 'EXPLORE' ? 2.2 : 1.7}
            />
            <Text style={[styles.tabLabel, currentTab === 'EXPLORE' && styles.tabLabelActive]}>
              Venues
            </Text>
          </TouchableOpacity>

          {/* Profile Tab */}
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setCurrentTab('PROFILE')}
            activeOpacity={0.7}
          >
            <ProfileIcon
              size={21}
              color={currentTab === 'PROFILE' ? '#000000' : '#94A3B8'}
              strokeWidth={currentTab === 'PROFILE' ? 2.2 : 1.7}
            />
            <Text style={[styles.tabLabel, currentTab === 'PROFILE' && styles.tabLabelActive]}>
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  bottomBar: {
    height: 64,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: -0.2,
  },
  tabLabelActive: {
    color: '#000000',
    fontWeight: '700',
  },
  scanFloatingBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
});
