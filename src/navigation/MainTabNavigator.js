import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Homescreen from '../screens/user/Homescreen';
import UserProfile from '../screens/user/UserProfile';
import AdmissionList from '../screens/user/AdmissionList';

const Tab = createMaterialTopTabNavigator();

const tabs = [
  { name: 'StudyPoint', activeIcon: 'home', inactiveIcon: 'home-outline' },
  { name: 'Admissions', activeIcon: 'document-text', inactiveIcon: 'document-text-outline' },
  { name: 'Profile', activeIcon: 'person', inactiveIcon: 'person-outline' },
];

// Defined outside to prevent React from re-creating the component type on every render
const CustomTabBar = ({ state, navigation, insets }) => (
  <View style={[styles.tabBar, { paddingBottom: Math.max(8, insets.bottom) }]}>
    {state.routes.map((route, index) => {
      const isFocused = state.index === index;
      const tab = tabs.find((t) => t.name === route.name);

      const onPress = () => {
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });
        if (!isFocused && !event.defaultPrevented) {
          navigation.navigate(route.name);
        }
      };

      return (
        <TouchableOpacity key={route.key} onPress={onPress} style={styles.tabItem} activeOpacity={0.7}>
          <View style={[styles.iconWrapper, isFocused && styles.iconWrapperActive]}>
            <Ionicons
              name={isFocused ? tab?.activeIcon : tab?.inactiveIcon}
              size={22}
              color={isFocused ? '#1A73E8' : '#6B7280'}
            />
          </View>
        </TouchableOpacity>
      );
    })}
  </View>
);

export default function MainTabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Tab.Navigator
        tabBarPosition="bottom"
        tabBar={(props) => <CustomTabBar {...props} insets={insets} />}
        screenOptions={{
          swipeEnabled: true,
          animationEnabled: true,
        }}
      >
        <Tab.Screen name="StudyPoint" component={Homescreen} />
        <Tab.Screen name="Admissions" component={AdmissionList} />
        <Tab.Screen name="Profile" component={UserProfile} />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  tabBar: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderTopWidth: 0.5, borderTopColor: '#E5E7EB', paddingTop: 6, },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconWrapper: { width: 44, height: 36, borderRadius: 20, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', },
  iconWrapperActive: { backgroundColor: '#E8F0FE' },
});