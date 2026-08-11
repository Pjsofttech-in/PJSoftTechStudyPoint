import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, StatusBar, LayoutAnimation, Platform, UIManager, } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getUserById, getStoredUserData } from '../../util/apicall';

const BRAND_COLOR = '#7B68EE';

// Enable layout animation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const UserProfile = () => {
  const insets = useSafeAreaInsets();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Collapsible section states (default closed/false)
  const [isAcademicExpanded, setIsAcademicExpanded] = useState(false);
  const [isPaymentExpanded, setIsPaymentExpanded] = useState(false);

  const toggleAcademic = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsAcademicExpanded((prev) => !prev);
  };

  const togglePayment = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsPaymentExpanded((prev) => !prev);
  };

  const fetchUserData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setErrorMsg(null);

      const storedData = await getStoredUserData();
      if (!storedData?.id || !storedData?.email) {
        throw new Error('User session invalid. Please log in again.');
      }

      const data = await getUserById(storedData.id, storedData.role || 'user', storedData.email);
      setUserData(data || {});
    } catch (error) {
      setErrorMsg(error?.message || 'Failed to fetch user profile.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Safe Helpers
  const getInitials = (name) => (name && typeof name === 'string' ? name.charAt(0).toUpperCase() : 'U');

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const parsedDate = new Date(dateString);
    return isNaN(parsedDate.getTime()) ? '-' : parsedDate.toLocaleDateString('en-IN');
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={BRAND_COLOR} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <Ionicons name="cloud-offline-outline" size={52} color="#EF4444" />
        <Text style={styles.errorTitle}>Unable to load profile</Text>
        <Text style={styles.errorSubtitle}>{errorMsg}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchUserData()}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isActive = userData?.status?.toLowerCase() === 'active';
  const isPaymentComplete = userData?.paymentstatus?.toLowerCase() === 'complete';

  return (
    <View style={[styles.mainWrapper, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Screen AppBar */}
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>Profile</Text>
        <TouchableOpacity style={styles.appBarAction} onPress={() => fetchUserData(true)}>
          <Ionicons name="refresh-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => fetchUserData(true)} 
            tintColor={BRAND_COLOR} 
          />
        }
      >
        {/* User Profile Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(userData?.name)}</Text>
          </View>
          <View style={styles.headerInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>{userData?.name || 'Student'}</Text>
              <View style={[styles.badge, { backgroundColor: isActive ? '#10B98115' : '#64748B15' }]}>
                <Text style={[styles.badgeText, { color: isActive ? '#059669' : '#64748B' }]}>
                  {userData?.status || 'Active'}
                </Text>
              </View>
            </View>
            <Text style={styles.subtext} numberOfLines={1}>{userData?.email || '-'}</Text>
            <Text style={styles.subtext}>
              {userData?.mobileNumber || '-'} • {userData?.branchCode || '-'}
            </Text>
          </View>
        </View>

        {/* Seat Allocation Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <MaterialCommunityIcons name="sofa-outline" size={20} color={BRAND_COLOR} />
            <Text style={styles.heroTitle}>Seat Allocation</Text>
          </View>
          <View style={styles.heroGrid}>
            <View style={styles.heroStat}>
              <Text style={styles.statLabel}>SEAT NO.</Text>
              <Text style={styles.statValue}>{userData?.seatNumber ?? '-'}</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.statLabel}>TYPE</Text>
              <Text style={styles.statValue}>{userData?.seatType ?? '-'}</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.statLabel}>DEPOSIT</Text>
              <Text style={styles.statValue}>₹{userData?.deposit ?? '0'}</Text>
            </View>
          </View>
        </View>

        {/* Personal Details Section */}
        <View style={styles.sectionCard}>
          <View style={[styles.sectionHeader, styles.sectionHeaderWithBorder]}>
            <View style={styles.headerTitleGroup}>
              <Ionicons name="person-outline" size={18} color={BRAND_COLOR} />
              <Text style={styles.sectionTitle}>Personal Details</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>City</Text>
            <Text style={styles.value}>{userData?.city || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Taluka</Text>
            <Text style={styles.value}>{userData?.taluka || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>District & State</Text>
            <Text style={styles.value}>
              {userData?.district || '-'}, {userData?.state || '-'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Pincode</Text>
            <Text style={styles.value}>{userData?.pincode || '-'}</Text>
          </View>
          <View style={styles.infoRowLast}>
            <Text style={styles.label}>Emergency Mobile</Text>
            <Text style={styles.value}>{userData?.emergencyContact || '-'}</Text>
          </View>
        </View>

        {/* Academic Details Section (Collapsible - Default Closed) */}
        <View style={styles.sectionCard}>
          <TouchableOpacity
            style={[
              styles.sectionHeader,
              isAcademicExpanded && styles.sectionHeaderWithBorder,
            ]}
            onPress={toggleAcademic}
            activeOpacity={0.7}
          >
            <View style={styles.headerTitleGroup}>
              <MaterialCommunityIcons name="school-outline" size={18} color={BRAND_COLOR} />
              <Text style={styles.sectionTitle}>Academic Details</Text>
            </View>
            <Ionicons
              name={isAcademicExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
              size={18}
              color="#64748B"
            />
          </TouchableOpacity>

          {isAcademicExpanded && (
            <View style={styles.collapsibleContent}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Preparing For</Text>
                <Text style={styles.value}>{userData?.preparationFor || '-'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Study Source</Text>
                <Text style={styles.value}>{userData?.studySource || '-'}</Text>
              </View>
              <View style={styles.infoRowLast}>
                <Text style={styles.label}>Registered On</Text>
                <Text style={styles.value}>{formatDate(userData?.registrationDate)}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Seat & Payment Details Section (Collapsible - Default Closed) */}
        <View style={styles.sectionCard}>
          <TouchableOpacity
            style={[
              styles.sectionHeader,
              isPaymentExpanded && styles.sectionHeaderWithBorder,
            ]}
            onPress={togglePayment}
            activeOpacity={0.7}
          >
            <View style={styles.headerTitleGroup}>
              <MaterialCommunityIcons name="credit-card-outline" size={18} color={BRAND_COLOR} />
              <Text style={styles.sectionTitle}>Seat & Payment Details</Text>
            </View>
            <Ionicons
              name={isPaymentExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
              size={18}
              color="#64748B"
            />
          </TouchableOpacity>

          {isPaymentExpanded && (
            <View style={styles.collapsibleContent}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Seat Amount</Text>
                <Text style={styles.value}>₹{userData?.seatAmount ?? '0'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Payment Mode</Text>
                <Text style={styles.value}>{userData?.paymentmode || '-'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Payment Status</Text>
                <Text style={[styles.value, { color: isPaymentComplete ? '#059669' : '#DC2626' }]}>
                  {userData?.paymentstatus || '-'}
                </Text>
              </View>
              <View style={styles.infoRowLast}>
                <Text style={styles.label}>Remark</Text>
                <Text style={styles.value}>{userData?.remark || '-'}</Text>
              </View>
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
};

export default UserProfile;

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1, paddingHorizontal: 16 },
  scrollContent: { paddingBottom: 24 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 24 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748B', fontFamily: 'Poppins-Regular' },
  errorTitle: { fontSize: 18, fontFamily: 'Poppins-SemiBold', color: '#DC2626', marginTop: 12 },
  errorSubtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 6, marginBottom: 20, fontFamily: 'Poppins-Regular' },
  retryButton: { backgroundColor: BRAND_COLOR, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryButtonText: { color: '#FFFFFF', fontFamily: 'Poppins-SemiBold', fontSize: 14 },
  
  // AppBar
  appBar: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: '#F8FAFC' },
  appBarTitle: { fontSize: 20, fontFamily: 'Poppins-SemiBold', color: '#0F172A' },
  appBarAction: { padding: 6, borderRadius: 20, backgroundColor: '#E2E8F0' },

  // Header Card
  headerCard: { backgroundColor: '#FFFFFF', marginTop: 8, padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', elevation: 1 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: BRAND_COLOR, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 18, fontFamily: 'Poppins-SemiBold', color: '#FFFFFF' },
  headerInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  name: { fontSize: 16, fontFamily: 'Poppins-SemiBold', color: '#0F172A', flex: 1, marginRight: 8 },
  subtext: { fontSize: 12, color: '#64748B', marginTop: 1, fontFamily: 'Poppins-Regular' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { fontSize: 10, fontFamily: 'Poppins-SemiBold', textTransform: 'uppercase' },

  // Hero Seat Card
  heroCard: { backgroundColor: '#FFFFFF', marginTop: 12, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', elevation: 1 },
  heroHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  heroTitle: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: '#334155' },
  heroGrid: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#F1F5F9', paddingVertical: 12, paddingHorizontal: 8, borderRadius: 12 },
  heroStat: { alignItems: 'center', flex: 1 },
  heroDivider: { width: 1, height: 24, backgroundColor: '#CBD5E1' },
  statLabel: { fontSize: 9, color: '#64748B', fontFamily: 'Poppins-SemiBold', marginBottom: 2 },
  statValue: { fontSize: 15, fontFamily: 'Poppins-SemiBold', color: BRAND_COLOR },

  // Section Cards
  sectionCard: { backgroundColor: '#FFFFFF', marginTop: 12, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#E2E8F0', elevation: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionHeaderWithBorder: { paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: '#0F172A' },
  collapsibleContent: { paddingTop: 2 },
  
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  infoRowLast: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10 },
  label: { fontSize: 12, color: '#64748B', fontFamily: 'Poppins-Medium' },
  value: { fontSize: 12, color: '#0F172A', fontFamily: 'Poppins-SemiBold', textTransform: 'capitalize' },
});