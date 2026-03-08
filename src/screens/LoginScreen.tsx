import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { theme } from '../theme/colors';
import { useStore } from '../store/useStore';

import { supabase } from '../lib/supabase';

// Required for web browser auth redirects to return to the app smoothly
WebBrowser.maybeCompleteAuthSession();

// Setup your Auth0 variables here
const auth0ClientId = 'jIghKHutk4A9z2LsezkLmHcnw1Mo58Jb';
const auth0Domain = 'https://dev-yk8h2pi8f07c5icq.us.auth0.com/';

export default function LoginScreen() {
  const setUser = useStore(state => state.setUser);
  const fetchUserData = useStore(state => state.fetchUserData);
  const [loading, setLoading] = useState(false);

  // Define Auth0 Auth Request
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: auth0ClientId,
      responseType: AuthSession.ResponseType.Token,
      scopes: ['openid', 'profile', 'email'],
      redirectUri: AuthSession.makeRedirectUri({ scheme: 'oasisapp' }),
    },
    { authorizationEndpoint: `${auth0Domain}/authorize` }
  );

  useEffect(() => {
    if (response) {
      console.log('Auth0 Response:', JSON.stringify(response, null, 2));

      if (response.type === 'error') {
        Alert.alert('Authentication error', response.params.error_description || 'Something went wrong');
        return;
      }

      if (response.type === 'success') {
        const token = response.authentication?.accessToken || response.params?.access_token;
        if (!token) {
          Alert.alert('Auth Error', 'No access token was returned by Auth0.');
        } else {
          fetchUserInfo(token);
        }
      }
    }
  }, [response]);

  // Helper to convert Auth0 string ID to an integer for your Supabase int8 column
  const hashStringToInt = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(); // Return as string but it is a valid numeric integer
  };

  async function fetchUserInfo(accessToken?: string) {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetch(`${auth0Domain}/userinfo`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const userInfo = await res.json();

      // Convert Auth0 string ID (e.g. auth0|1234) into a numeric ID for the DB
      const userId = hashStringToInt(userInfo.sub || Date.now().toString());

      // Ensure user exists in Supabase User table
      const { data, error } = await supabase
        .from('User')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      let userFakeId = data?.fake_id;

      if (!data && !error) {
        // Insert new user
        const { data: insertData, error: insertError } = await supabase
          .from('User')
          .insert({ id: parseInt(userId, 10), world_level: 1, room_level: 1 })
          .select()
          .single();

        if (insertError) {
          console.error("Error creating user in Supabase:", insertError);
          Alert.alert('Database Error', `Could not create user profile in Supabase: ${insertError.message}`);
        } else {
          console.log("Successfully created user in Supabase");
          userFakeId = insertData.fake_id;
        }
      } else if (error) {
        console.error("Error fetching user from Supabase:", error);
      }

      // Restore user's tasks and level
      let alreadyOnboarded = false;
      if (userFakeId) {
        await fetchUserData(userFakeId);

        // Check if user has already completed onboarding (has answers in Question_Answer)
        console.log('🔍 Checking Question_Answer for fake_id:', userFakeId);
        const { data: existingAnswers, error: qaError } = await supabase
          .from('Question_Answer')
          .select('question_id, answer')
          .eq('user_id', userFakeId);

        console.log('🔍 Question_Answer result:', JSON.stringify(existingAnswers), 'error:', JSON.stringify(qaError));

        if (existingAnswers && existingAnswers.length > 0) {
          // User already onboarded — restore their name/goal and skip onboarding
          const goalAnswer = existingAnswers.find((a: any) => a.question_id === 2);

          if (goalAnswer?.answer) {
            useStore.getState().setUserGoal(goalAnswer.answer);
          }

          alreadyOnboarded = true;
          console.log('✅ Returning user detected — will skip onboarding');
        } else {
          console.log('ℹ️ No existing answers found — user needs onboarding');
        }
      } else {
        console.warn('⚠️ No fake_id found — cannot check Question_Answer');
      }

      // Set onboarded FIRST so that when setUser triggers the re-render,
      // App.tsx already sees isOnboarded=true and skips the onboarding screen.
      if (alreadyOnboarded) {
        useStore.getState().setOnboarded(true);
      }

      // Now set the user — this triggers the navigation switch in App.tsx
      setUser({ id: userId.toString(), fake_id: userFakeId, email: userInfo.email, name: userInfo.name });
    } catch (e) {
      console.error('Error fetching user info:', e);
      Alert.alert('Error', 'Failed to retrieve user information.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Welcome to Evergreen</Text>
          <Text style={styles.subtitle}>Begin your gentle journey today or pick up where you left off.</Text>
        </View>

        <View style={styles.formContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            disabled={!request || loading}
            onPress={() => promptAsync()}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Continue with Auth0</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setUser({ id: `guest_${Date.now()}`, isGuest: true })}
          >
            <Text style={styles.secondaryButtonText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, padding: theme.spacing.xl, justifyContent: 'center' },
  headerContainer: { marginBottom: theme.spacing.xl, alignItems: 'center' },
  header: { fontSize: 32, fontWeight: '800', color: theme.colors.text, textAlign: 'center' },
  subtitle: { fontSize: 16, color: theme.colors.textLight, marginTop: 8, textAlign: 'center' },
  formContainer: { marginTop: 40 },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  secondaryButtonText: { color: theme.colors.primary, fontSize: 16, fontWeight: '600' },
});
