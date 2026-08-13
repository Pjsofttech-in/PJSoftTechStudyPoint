import React, { useEffect, useState, useCallback, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, StatusBar, Animated, Easing, RefreshControl, ActivityIndicator, } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../../store/authStore';
import { getUserById } from '../../util/apicall';

const BRAND_COLOR = '#4F46E5';

const Homescreen = () => {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  // Animation reference for refresh button spin
  const spinValue = useRef(new Animated.Value(0)).current;

  const fetchProfile = useCallback(async (isRefresh = false) => {
    const { user: currentUser, login } = useAuthStore.getState();

    if (!currentUser?.id || !currentUser?.email) return;

    try {
      spinValue.setValue(0);
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();

      if (isRefresh) setRefreshing(true);
      else if (!currentUser?.name) setLoading(true);

      const data = await getUserById(
        currentUser.id,
        currentUser.role || 'user',
        currentUser.email
      );

      if (data) {
        login({ ...currentUser, ...data });
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error?.message || error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [spinValue]);

  useEffect(() => {
    if (!user?.name) {
      fetchProfile();
    }
  }, [user?.id, user?.name, fetchProfile]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.mainWrapper, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Simplified AppBar */}
      <View style={styles.appBar}>
        <View style={styles.profileBrandGroup}>
          <View style={styles.titleTextGroup}>
            <Text style={styles.brandTitle}>StudyPoint</Text>
            <Text style={styles.brandSub}>Dashboard</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => fetchProfile(true)}
          activeOpacity={0.75}
          accessibilityLabel="Refresh Profile"
          accessibilityRole="button"
        >
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons name="sparkles" size={18} color={BRAND_COLOR} />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchProfile(true)}
            tintColor={BRAND_COLOR}
          />
        }
      >
        <View style={styles.banner}>
          <Text style={styles.greeting}>Welcome back,</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" style={styles.loader} />
          ) : (
            <Text style={styles.userName}>{user?.name || 'Student'}</Text>
          )}
          <Text style={styles.bannerSubtitle}>StudyPoint Dashboard</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default Homescreen;

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  appBar: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, backgroundColor: '#F8FAFC', },
  profileBrandGroup: { flexDirection: 'row', alignItems: 'center' },
  titleTextGroup: { justifyContent: 'center' },
  brandTitle: { fontSize: 18, fontFamily: 'Poppins-SemiBold', color: '#0F172A', lineHeight: 22, },
  brandSub: { fontSize: 11, fontFamily: 'Poppins-Medium', color: '#64748B', lineHeight: 14, },
  actionButton: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E0E7FF', },
  banner: { backgroundColor: '#1A73E8', padding: 20, margin: 16, borderRadius: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, },
  greeting: { fontSize: 13, color: '#DBEAFE', fontFamily: 'Poppins-Medium' },
  userName: { fontSize: 22, fontFamily: 'Poppins-SemiBold', color: '#FFFFFF', marginTop: 2 },
  bannerSubtitle: { fontSize: 12, color: '#BFDBFE', marginTop: 6, fontFamily: 'Poppins-Regular' },
  loader: { alignSelf: 'flex-start', marginVertical: 4 },
});