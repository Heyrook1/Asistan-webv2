import { useEffect, useMemo, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { apiGet, apiPost } from '@/lib/api'
import { palette, radii, shadows, spacing } from '@/lib/theme'
import type { AvailabilitySlot } from '@/lib/types'

type DoctorDetailResponse = {
  doctor: {
    id: string
    fullName: string
    clinic: {
      id: string
      name: string
    }
    services: Array<{
      id: string
      name: string
      durationMin: number
      price: number | null
      currency: string
    }>
  }
}

type ProfileResponse = {
  profile: {
    fullName: string
    phone: string | null
    email: string | null
    address: string | null
    city: string | null
  } | null
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export default function ClientBookDoctorScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ doctorId: string; serviceId?: string; startTime?: string }>()
  const doctorId = useMemo(() => String(params.doctorId ?? ''), [params.doctorId])
  const prefServiceId = useMemo(
    () => (typeof params.serviceId === 'string' ? params.serviceId : null),
    [params.serviceId]
  )
  const prefStart = useMemo(
    () => (typeof params.startTime === 'string' ? params.startTime : null),
    [params.startTime]
  )

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [doctor, setDoctor] = useState<DoctorDetailResponse['doctor'] | null>(null)
  const [date, setDate] = useState(todayIso())
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [selectedStart, setSelectedStart] = useState<string | null>(prefStart)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')

  useEffect(() => {
    if (!doctorId) return
    setLoading(true)
    Promise.all([
      apiGet<DoctorDetailResponse>(`/api/client/doctors/${doctorId}`),
      apiGet<ProfileResponse>('/api/client/profile'),
    ])
      .then(([doctorResponse, profileResponse]) => {
        setDoctor(doctorResponse.doctor)
        setSelectedServiceId(prefServiceId ?? doctorResponse.doctor.services[0]?.id ?? null)
        if (profileResponse.profile) {
          setFullName(profileResponse.profile.fullName ?? '')
          setPhone(profileResponse.profile.phone ?? '')
          setEmail(profileResponse.profile.email ?? '')
          setAddress(profileResponse.profile.address ?? '')
          setCity(profileResponse.profile.city ?? '')
        }
      })
      .catch((e) => {
        Alert.alert('Hata', e instanceof Error ? e.message : 'Randevu ekrani acilamadi')
      })
      .finally(() => setLoading(false))
  }, [doctorId, prefServiceId])

  useEffect(() => {
    if (!doctor || !selectedServiceId || !date) return
    apiGet<{ slots: AvailabilitySlot[] }>(
      `/api/client/availability?businessId=${doctor.clinic.id}&doctorId=${doctor.id}&serviceId=${selectedServiceId}&date=${date}`
    )
      .then((response) => {
        setSlots(response.slots)
        if (selectedStart && !response.slots.some((slot) => slot.startTime === selectedStart)) {
          setSelectedStart(null)
        }
      })
      .catch(() => setSlots([]))
  }, [doctor, selectedServiceId, date, selectedStart])

  async function submitBooking() {
    if (!doctor || !selectedServiceId || !selectedStart) {
      Alert.alert('Eksik bilgi', 'Lutfen hizmet ve saat secin.')
      return
    }
    if (!fullName.trim() || !phone.trim()) {
      Alert.alert('Eksik bilgi', 'Ad soyad ve telefon zorunludur.')
      return
    }

    setSaving(true)
    try {
      const result = await apiPost<{
        ok: boolean
        data?: { appointmentId: string; status: string; message: string }
        error?: string
      }>('/api/client/bookings', {
        businessId: doctor.clinic.id,
        doctorId: doctor.id,
        serviceId: selectedServiceId,
        date,
        startTime: selectedStart,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        note: note.trim() || null,
        address: address.trim() || null,
        city: city.trim() || null,
      })

      if (!result.ok) {
        Alert.alert('Randevu olusturulamadi', result.error ?? 'Lutfen tekrar deneyin.')
        return
      }

      Alert.alert('Basarili', result.data?.message ?? 'Randevu olusturuldu.')
      router.replace('/client/appointments')
    } catch (e) {
      Alert.alert('Hata', e instanceof Error ? e.message : 'Randevu olusturulamadi')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !doctor) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={palette.primary} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.title}>Randevu Olustur</Text>
          <Text style={styles.subtitle}>
            {doctor.fullName} - {doctor.clinic.name}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1) Hizmet Sec</Text>
          <View style={styles.rowWrap}>
            {doctor.services.map((service) => (
              <Pressable
                key={service.id}
                style={[
                  styles.chip,
                  selectedServiceId === service.id && styles.chipActive,
                ]}
                onPress={() => setSelectedServiceId(service.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedServiceId === service.id && styles.chipTextActive,
                  ]}
                >
                  {service.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2) Tarih ve Saat Sec</Text>
          <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
          <View style={styles.rowWrap}>
            {slots.length === 0 ? (
              <Text style={styles.empty}>Secilen gun icin uygun saat bulunamadi.</Text>
            ) : (
              slots.map((slot) => (
                <Pressable
                  key={slot.startTime}
                  style={[
                    styles.slot,
                    selectedStart === slot.startTime && styles.slotActive,
                  ]}
                  onPress={() => setSelectedStart(slot.startTime)}
                >
                  <Text
                    style={[
                      styles.slotText,
                      selectedStart === slot.startTime && styles.slotTextActive,
                    ]}
                  >
                    {slot.startTime}
                  </Text>
                </Pressable>
              ))
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3) Bilgilerini Gir</Text>
          <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Ad Soyad" />
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Telefon" keyboardType="phone-pad" />
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="E-posta (opsiyonel)" autoCapitalize="none" />
          <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Adres (opsiyonel)" />
          <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Sehir (opsiyonel)" />
          <TextInput
            style={[styles.input, styles.textarea]}
            value={note}
            onChangeText={setNote}
            placeholder="Not (opsiyonel)"
            multiline
          />
        </View>
      </ScrollView>

      <View style={styles.sticky}>
        <Pressable style={styles.confirmButton} disabled={saving} onPress={submitBooking}>
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
              <Text style={styles.confirmText}>4) Randevuyu Onayla</Text>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: {
    padding: spacing.md,
    paddingBottom: 110,
    gap: spacing.sm,
  },
  hero: {
    borderRadius: radii.lg,
    backgroundColor: palette.heroMid,
    padding: spacing.lg,
    gap: 4,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  subtitle: { color: '#BCD1EF', fontWeight: '600' },
  section: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    padding: spacing.md,
    gap: 10,
    ...shadows.card,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: palette.text },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: '#CAD8EC',
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  chipActive: {
    borderColor: palette.primary,
    backgroundColor: '#ECFFFA',
  },
  chipText: { color: '#334762', fontWeight: '600' },
  chipTextActive: { color: palette.primaryDark },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: palette.text,
    backgroundColor: '#FFFFFF',
  },
  textarea: {
    minHeight: 84,
    textAlignVertical: 'top',
  },
  slot: {
    borderWidth: 1,
    borderColor: '#B8EFE4',
    backgroundColor: '#ECFFFA',
    borderRadius: radii.sm,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  slotActive: {
    borderColor: palette.primary,
    backgroundColor: palette.primary,
  },
  slotText: { color: palette.primaryDark, fontWeight: '700' },
  slotTextActive: { color: '#ffffff' },
  empty: { color: palette.textMuted },
  sticky: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.md,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  confirmButton: {
    height: 48,
    borderRadius: radii.md,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  confirmText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
})
