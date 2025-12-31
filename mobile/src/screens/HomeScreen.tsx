import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>السلام عليكم</Text>
        <Text style={styles.subtitle}>Welcome to Noor SuperApp</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🕌 Prayer Times</Text>
          <Text style={styles.cardText}>View today's prayer schedule</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📖 Daily Quran</Text>
          <Text style={styles.cardText}>Read your daily verse</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>💰 SadaqahChain</Text>
          <Text style={styles.cardText}>Make a donation</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🤖 IslamVerse AI</Text>
          <Text style={styles.cardText}>Ask questions about Islam</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#009688',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#36454F',
    textAlign: 'center',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#009688',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    color: '#36454F',
  },
});
