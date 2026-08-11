import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useAuthStore } from '../../store/authStore';

const Homescreen = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.banner}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.name || 'Student'}</Text>
        <Text style={styles.bannerSubtitle}>StudyPoint Dashboard</Text>
      </View>
    </ScrollView>
  );
};

export default Homescreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  banner: { backgroundColor: '#1A73E8', padding: 20, margin: 16, borderRadius: 16, elevation: 3, },
  greeting: { fontSize: 13, color: '#DBEAFE', fontFamily: 'Poppins-Medium' },
  userName: { fontSize: 22, fontFamily: 'Poppins-SemiBold', color: '#FFFFFF', marginTop: 2 },
  bannerSubtitle: { fontSize: 12, color: '#BFDBFE', marginTop: 6, fontFamily: 'Poppins-Regular' },
});