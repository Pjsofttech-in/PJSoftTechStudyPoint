import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, StatusBar, LayoutAnimation, Platform, UIManager, } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuthStore } from '../../store/authStore';
import { getAdmissionsByUser } from '../../util/apicall';

const BRAND_COLOR = '#7B68EE';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AdmissionList = () => {
  const insets = useSafeAreaInsets();
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const fetchAdmissions = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setErrorMsg(null);

      const userData = useAuthStore.getState().user;
      if (!userData?.id || !userData?.email) {
        throw new Error('User session invalid. Please log in again.');
      }

      const response = await getAdmissionsByUser(userData.id, userData.email);

      if (response?.success) {
        setAdmissions(response.data || []);
      } else {
        setErrorMsg(response?.error || 'Failed to retrieve admission records.');
      }
    } catch (err) {
      setErrorMsg(err?.message || 'Error connecting to service.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmissions();
  }, [fetchAdmissions]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const parsedDate = new Date(dateString);
    return isNaN(parsedDate.getTime())
      ? '-'
      : parsedDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return null;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} Days` : '1 Day';
  };

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const AdmissionCard = ({ item }) => {
    const isExpanded = expandedId === item.id;
    const isComplete = item.paymentstatus?.toLowerCase() === 'complete';
    const duration = calculateDays(item.startdate, item.enddate);
    
    return (
    <View style={styles.card}>
      {/* Pass Header */}
      <View style={styles.cardHeader}>
        <View style={styles.seatInfo}>
          <View style={styles.seatIconBg}>
            <MaterialCommunityIcons name="sofa-outline" size={20} color={BRAND_COLOR} />
          </View>
          <View>
            <Text style={styles.seatNumber}>{item.seatNumber || 'N/A'}</Text>
            <Text style={styles.seatTypeTag}>{item.seatType || 'Standard'} Seat</Text>
          </View>
        </View>
        
        <View style={[styles.badge, { backgroundColor: isComplete ? '#10B98115' : '#EF444415' }]}>
          <View style={[styles.badgeDot, { backgroundColor: isComplete ? '#10B981' : '#EF4444' }]} />
          <Text style={[styles.badgeText, { color: isComplete ? '#059669' : '#DC2626' }]}>
            {isComplete ? 'Paid' : 'Pending'}
          </Text>
        </View>
      </View>
      
      {/* Validity Timeline */}
      <View style={styles.timelineContainer}>
        <View style={styles.timelineRow}>
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>FROM</Text>
            <Text style={styles.dateValue}>{formatDate(item.startdate)}</Text>
          </View>
          
          <View style={styles.durationBadge}>
            <Ionicons name="time-outline" size={12} color="#64748B" />
            <Text style={styles.durationText}>{duration || 'Duration'}</Text>
          </View>
          
          <View style={[styles.dateBlock, { alignItems: 'flex-end' }]}>
            <Text style={styles.dateLabel}>TO</Text>
            <Text style={styles.dateValue}>{formatDate(item.enddate)}</Text>
          </View>
        </View>
        
        {/* Visual Track */}
        <View style={styles.trackBackground}>
          <View style={styles.trackFill} />
        </View>
      </View>

      {/* Amount Footer */}
      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.feeLabel}>Total Amount</Text>
          <Text style={styles.feeValue}>₹{item.seatAmount ? item.seatAmount.toLocaleString('en-IN') : '0'}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.detailsToggle} 
          onPress={() => toggleExpand(item.id)}
          activeOpacity={0.7}
          >
            <Text style={styles.detailsToggleText}>
              {isExpanded ? 'Hide Details' : 'View Details'}
            </Text>
            <Ionicons 
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={BRAND_COLOR}
            />
        </TouchableOpacity>
      </View>

      {/* Collapsible Details */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <Text style={styles.metaLabel}>Branch Code</Text>
              <Text style={styles.metaValue}>{item.branchCode || '-'}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.metaLabel}>Registered Mobile</Text>
              <Text style={styles.metaValue}>{item.mobNo || '-'}</Text>
            </View>
          </View>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <Text style={styles.metaLabel}>Issued By</Text>
              <Text style={styles.metaValue}>{item.createdByEmail || '-'}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.metaLabel}>Admission ID</Text>
              <Text style={styles.metaValue}>#{item.id}</Text>
            </View>
          </View>

          {item.remark ? (
            <View style={styles.remarkBox}>
              <Ionicons name="information-circle-outline" size={16} color="#D97706" />
              <Text style={styles.remarkText}>{item.remark}</Text>
            </View>
          ) : null}
        </View>
      )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={BRAND_COLOR} />
        <Text style={styles.loadingText}>Loading admission history...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <Ionicons name="cloud-offline-outline" size={52} color="#EF4444" />
        <Text style={styles.errorTitle}>Unable to load history</Text>
        <Text style={styles.errorSubtitle}>{errorMsg}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchAdmissions()}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.mainWrapper, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Screen AppBar */}
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>Admissions Breakdown</Text>
        <TouchableOpacity style={styles.appBarAction} onPress={() => fetchAdmissions(true)}>
          <Ionicons name="refresh-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={admissions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <AdmissionCard item={item} />}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => fetchAdmissions(true)} 
            tintColor={BRAND_COLOR} 
          />
        }
        ListHeaderComponent={
          admissions.length > 0 ? (
            <View style={styles.summaryBar}>
              <Text style={styles.summaryText}>
                Showing <Text style={styles.summaryBold}>{admissions.length}</Text> admission subscription(s)
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="text-box-remove-outline" size={56} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Admissions Found</Text>
            <Text style={styles.emptySub}>You do not have any registered admission records yet.</Text>
          </View>
        }
      />
    </View>
  );
};

export default AdmissionList;

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 24 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748B', fontFamily: 'Poppins-Regular' },
  errorTitle: { fontSize: 18, fontFamily: 'Poppins-SemiBold', color: '#DC2626', marginTop: 12 },
  errorSubtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 6, marginBottom: 20, fontFamily: 'Poppins-Regular' },
  retryButton: { backgroundColor: BRAND_COLOR, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryButtonText: { color: '#FFFFFF', fontFamily: 'Poppins-SemiBold', fontSize: 14 },

  appBar: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: '#F8FAFC' },
  appBarTitle: { fontSize: 20, fontFamily: 'Poppins-SemiBold', color: '#0F172A' },
  appBarAction: { padding: 6, borderRadius: 20, backgroundColor: '#E2E8F0' },

  summaryBar: { marginVertical: 8 },
  summaryText: { fontSize: 12, color: '#64748B', fontFamily: 'Poppins-Regular' },
  summaryBold: { fontFamily: 'Poppins-SemiBold', color: '#0F172A' },

  // Pass Card Styling
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, marginTop: 8, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seatInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  seatIconBg: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#7B68EE15', justifyContent: 'center', alignItems: 'center' },
  seatNumber: { fontSize: 16, fontFamily: 'Poppins-SemiBold', color: '#0F172A' },
  seatTypeTag: { fontSize: 11, color: '#64748B', fontFamily: 'Poppins-Medium' },

  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontFamily: 'Poppins-SemiBold', textTransform: 'uppercase' },

  // Timeline Track
  timelineContainer: { marginTop: 16, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  timelineRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dateBlock: { flex: 1 },
  dateLabel: { fontSize: 9, color: '#94A3B8', fontFamily: 'Poppins-SemiBold', letterSpacing: 0.5 },
  dateValue: { fontSize: 12, fontFamily: 'Poppins-SemiBold', color: '#334155', marginTop: 2 },
  durationBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E2E8F0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  durationText: { fontSize: 10, fontFamily: 'Poppins-Medium', color: '#475569' },
  trackBackground: { height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, overflow: 'hidden' },
  trackFill: { width: '100%', height: '100%', backgroundColor: BRAND_COLOR },

  // Card Footer
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  feeLabel: { fontSize: 10, color: '#64748B', fontFamily: 'Poppins-Medium', textTransform: 'uppercase' },
  feeValue: { fontSize: 16, fontFamily: 'Poppins-SemiBold', color: '#059669', marginTop: 1 },
  detailsToggle: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, backgroundColor: '#7B68EE10' },
  detailsToggleText: { fontSize: 11, fontFamily: 'Poppins-SemiBold', color: BRAND_COLOR },

  // Collapsible Meta Details
  expandedContent: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9', gap: 10 },
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  infoCol: { flex: 1 },
  metaLabel: { fontSize: 11, color: '#64748B', fontFamily: 'Poppins-Medium' },
  metaValue: { fontSize: 12, color: '#0F172A', fontFamily: 'Poppins-SemiBold', marginTop: 2 },
  remarkBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEF3C7', padding: 10, borderRadius: 8 },
  remarkText: { fontSize: 11, color: '#92400E', flex: 1, fontFamily: 'Poppins-Medium' },

  // Empty State
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyTitle: { fontSize: 16, fontFamily: 'Poppins-SemiBold', color: '#334155', marginTop: 12 },
  emptySub: { fontSize: 12, color: '#64748B', marginTop: 4, textAlign: 'center', fontFamily: 'Poppins-Regular' },
});