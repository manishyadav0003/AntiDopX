import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SportItem {
  id: string;
  title: string;
  iconName: string;
  isFeather?: boolean;
}

const sports: SportItem[] = [
  { id: 'athletics', title: 'Athletics', iconName: 'run' },
  { id: 'football', title: 'Football', iconName: 'soccer' },
  { id: 'cricket', title: 'Cricket', iconName: 'cricket' },
  { id: 'swimming', title: 'Swimming', iconName: 'swim' },
  { id: 'boxing', title: 'Boxing', iconName: 'boxing-glove' },
  { id: 'badminton', title: 'Badminton', iconName: 'badminton' },
  { id: 'weightlifting', title: 'Weightlifting', iconName: 'weight-lifter' },
  { id: 'martial-arts', title: 'Martial Arts', iconName: 'karate' },
  { id: 'other', title: 'Other Sports', iconName: 'target', isFeather: true },
];

export default function SportSelectionScreen() {
  const [selectedSport, setSelectedSport] = useState<string>('');

  const handleContinue = () => {
    router.push({
      pathname: '/athlete-details',
      params: {
        sport: selectedSport,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>What is your sport?</Text>
      <Text style={styles.subtitle}>
        We will personalize your clean sport curriculum.
      </Text>

      <FlatList
        data={sports}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isSelected = selectedSport === item.id;
          return (
            <TouchableOpacity
              style={[styles.card, isSelected && styles.activeCard]}
              onPress={() => setSelectedSport(item.id)}
            >
              <View style={[styles.iconBox, isSelected && styles.activeIconBox]}>
                {item.isFeather ? (
                  <Feather
                    name={item.iconName as any}
                    size={36}
                    color={isSelected ? '#0284C7' : '#0EA5E9'}
                  />
                ) : (
                  <MaterialCommunityIcons
                    name={item.iconName as any}
                    size={38}
                    color={isSelected ? '#0284C7' : '#0EA5E9'}
                  />
                )}
              </View>

              <Text style={[styles.cardText, isSelected && styles.activeCardText]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity
        disabled={!selectedSport}
        style={[styles.button, !selectedSport && { opacity: 0.5 }]}
        onPress={handleContinue}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06B6D4',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  subtitle: {
    color: '#E0F2FE',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  listContent: {
    paddingBottom: 16,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    margin: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 130,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  activeCard: {
    borderWidth: 2.5,
    borderColor: '#0284C7',
    transform: [{ scale: 1.02 }],
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#06B6D415',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeIconBox: {
    backgroundColor: '#0284C720',
  },
  cardText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 15,
    textAlign: 'center',
  },
  activeCardText: {
    color: '#0284C7',
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 999,
    marginBottom: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonText: {
    color: '#06B6D4',
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 16,
  },
});