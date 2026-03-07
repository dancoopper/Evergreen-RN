import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { theme } from '../theme/colors';
import { useStore } from '../store/useStore';

// Required for web browser auth redirects to return to the app smoothly
WebBrowser.maybeCompleteAuthSession();

// Setup your Auth0 variables here
const auth0ClientId = 'jIghKHutk4A9z2LsezkLmHcnw1Mo58Jb';
const auth0Domain = 'https://dev-yk8h2pi8f07c5icq.us.auth0.com';

export default function LoginScreen() {
  const setUser = useStore(state => state.setUser);

  // Define Auth0 Auth Request
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: auth0ClientId,
      scopes: ['openid', 'profile', 'email'],
      redirectUri: AuthSession.makeRedirectUri({ scheme: 'oasisapp' }),
    },
    { authorizationEndpoint: `${auth0Domain}/authorize` }
  );

  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'oasisapp' });
  console.log('🔑 REDIRECT URI:', redirectUri);
  console.log('🔑 REQUEST REDIRECT URI:', request?.redirectUri);
  console.log('🔑 FULL AUTH URL:', request?.url);

  useEffect(() => {
    if (response) {
      if (response.type === 'error') {
        Alert.alert('Authentication error', response.params.error_description || 'Something went wrong');
        return;
      }

      if (response.type === 'success') {
        // Retrieve access_token from the Auth0 explicit response.
        // Usually, you should call your Auth0 /userinfo endpoint to get full user details using response.authentication.accessToken
        // But for mock purposes, we create a generic user payload
        setUser({ id: 'auth0_user_123' });
      }
    }
  }, [response]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Welcome to Oasis</Text>
          <Text style={styles.subtitle}>Begin your gentle journey today or pick up where you left off.</Text>
        </View>

        <View style={styles.formContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            disabled={!request}
            onPress={() => promptAsync()}
          >
            <Text style={styles.primaryButtonText}>Continue with Auth0</Text>
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
