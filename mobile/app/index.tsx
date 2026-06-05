import { Redirect } from 'expo-router'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { useSessionContext } from '@/lib/session-context'

export default function HomeScreen() {
  const { loading, isAuthenticated } = useSessionContext()

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#14b8a6" />
      </View>
    )
  }

  if (isAuthenticated) {
    return <Redirect href="/client/search" />
  }

  return <Redirect href="/(auth)/login" />
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
})
