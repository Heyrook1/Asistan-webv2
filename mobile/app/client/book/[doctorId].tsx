import { useEffect, useMemo, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import {
  Alert,
  type DimensionValue,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'
import { AppButton, AppCard, AppInput, AppText, Badge, Chip, EmptyState, SectionHeader, Skeleton } from '@/components/ui'
import { apiGet, apiPost } from '@/lib/api'
import { useAppTheme } from '@/lib/use-app-theme'
import { palette } from '@/lib/theme'
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
  const theme = useAppTheme()
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
  const [step, setStep] = useState<1 | 2 | 3>(1)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [identityNumber, setIdentityNumber] = useState('')
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')

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
        }
      })
      .catch((e) => {
        Alert.alert('Hata', e instanceof Error ? e.message : 'Randevu ekranı açılamadı')
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

  const dateOptions = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 7 }).map((_, index) => {
      const value = new Date(today)
      value.setDate(today.getDate() + index)
      return {
        iso: value.toISOString().slice(0, 10),
        label: value.toLocaleDateString('tr-TR', { weekday: 'short', day: '2-digit', month: '2-digit' }),
      }
    })
  }, [])
  const selectedService = useMemo(
    () => doctor?.services.find((service) => service.id === selectedServiceId) ?? null,
    [doctor, selectedServiceId]
  )
  const selectedSlot = useMemo(
    () => slots.find((slot) => slot.startTime === selectedStart) ?? null,
    [slots, selectedStart]
  )
  const canContinueStep1 = Boolean(selectedServiceId)
  const canContinueStep2 = Boolean(selectedStart)
  const canSubmit = Boolean(
    fullName.trim() && phone.trim() && identityNumber.trim().length >= 5 && selectedServiceId && selectedStart,
  )

  async function submitBooking() {
    if (!doctor || !selectedServiceId || !selectedStart) {
      Alert.alert('Eksik bilgi', 'Lütfen hizmet ve saat seçin.')
      return
    }
    if (!fullName.trim() || !phone.trim() || identityNumber.trim().length < 5) {
      Alert.alert('Eksik bilgi', 'Ad soyad, telefon ve kimlik / pasaport no zorunludur.')
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
        identityNumber: identityNumber.trim(),
        email: email.trim() || null,
        note: note.trim() || null,
      })

      if (!result.ok) {
        Alert.alert('Randevu oluşturulamadı', result.error ?? 'Lütfen tekrar deneyin.')
        return
      }

      Alert.alert(
        'Randevu oluşturuldu',
        result.data?.message ?? 'Randevunuz kaydedildi — Randevular sekmesinden yönetebilirsiniz.',
        [{ text: 'Randevularım', onPress: () => router.replace('/client/appointments') }]
      )
    } catch (e) {
      Alert.alert('Hata', e instanceof Error ? e.message : 'Randevu oluşturulamadı')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !doctor) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
        <View style={{ padding: 16, gap: 10 }}>
          <Skeleton height={140} />
          <Skeleton height={110} />
          <Skeleton height={110} />
        </View>
      </SafeAreaView>
    )
  }

  const progressWidth = `${(step / 3) * 100}%` as DimensionValue

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.hero, { backgroundColor: theme.colors.heroMid }]}>
          <AppText variant="title" color="#FFFFFF">
            Randevu al
          </AppText>
          <AppText variant="caption" color="#D5E5FF">
            {doctor.fullName} · {doctor.clinic.name}
          </AppText>
          <View style={[styles.progressTrack, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <View style={[styles.progressValue, { width: progressWidth }]} />
          </View>
          <View style={styles.progressMeta}>
            <Badge label={`Adım ${step}/3`} tone="info" />
            <AppText variant="micro" color="#D5E5FF">
              Hizmet → Saat → Onay
            </AppText>
          </View>
        </View>

        {step === 1 ? (
          <AppCard>
            <SectionHeader title="1) Ne için?" subtitle="İhtiyacınıza uygun hizmeti seçin" />
            <View style={styles.rowWrap}>
              {doctor.services.map((service) => (
                <Chip
                  key={service.id}
                  label={`${service.name} · ${service.durationMin} dk`}
                  selected={selectedServiceId === service.id}
                  onPress={() => setSelectedServiceId(service.id)}
                />
              ))}
            </View>
            <AppButton
              label="Devam et"
              disabled={!canContinueStep1}
              onPress={() => setStep(2)}
              style={{ marginTop: theme.spacing.sm }}
            />
          </AppCard>
        ) : null}

        {step === 2 ? (
          <AppCard>
            <SectionHeader title="2) Ne zaman?" subtitle="Gerçek müsait saatlerden seçin" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
              {dateOptions.map((option) => (
                <Chip
                  key={option.iso}
                  label={option.label}
                  selected={date === option.iso}
                  onPress={() => setDate(option.iso)}
                />
              ))}
            </ScrollView>
            <View style={styles.rowWrap}>
              {slots.length === 0 ? (
                <EmptyState
                  icon="time-outline"
                  title="Müsait saat bulunamadı"
                  description="Farklı bir tarih seçerek devam edebilirsiniz."
                />
              ) : (
                slots.map((slot) => (
                  <Pressable
                    key={slot.startTime}
                    accessibilityRole="button"
                    accessibilityLabel={`${slot.startTime} saatini seç`}
                    style={[
                      styles.slot,
                      {
                        minHeight: 44,
                        borderColor: selectedStart === slot.startTime ? theme.colors.primary : theme.colors.border,
                        backgroundColor:
                          selectedStart === slot.startTime ? theme.colors.primary : theme.colors.surfaceSoft,
                      },
                    ]}
                    onPress={() => setSelectedStart(slot.startTime)}
                  >
                    <AppText
                      variant="caption"
                      color={selectedStart === slot.startTime ? '#FFFFFF' : theme.colors.text}
                    >
                      {slot.startTime}
                    </AppText>
                  </Pressable>
                ))
              )}
            </View>
            <View style={styles.wizardRow}>
              <AppButton label="Geri" variant="ghost" onPress={() => setStep(1)} style={{ flex: 1 }} />
              <AppButton
                label="Devam et"
                disabled={!canContinueStep2}
                onPress={() => setStep(3)}
                style={{ flex: 1 }}
              />
            </View>
          </AppCard>
        ) : null}

        {step === 3 ? (
          <AppCard>
            <SectionHeader title="3) Onayla" subtitle="Özet ve iletişim — profilinizden dolduruldu" />
            <View style={styles.summaryRow}>
              <AppText variant="micro" color={theme.colors.textMuted}>
                Doktor
              </AppText>
              <AppText variant="caption">{doctor.fullName}</AppText>
            </View>
            <View style={styles.summaryRow}>
              <AppText variant="micro" color={theme.colors.textMuted}>
                Klinik
              </AppText>
              <AppText variant="caption">{doctor.clinic.name}</AppText>
            </View>
            <View style={styles.summaryRow}>
              <AppText variant="micro" color={theme.colors.textMuted}>
                Hizmet
              </AppText>
              <AppText variant="caption">{selectedService?.name ?? '—'}</AppText>
            </View>
            <View style={styles.summaryRow}>
              <AppText variant="micro" color={theme.colors.textMuted}>
                Tarih / Saat
              </AppText>
              <AppText variant="caption">
                {date} {selectedSlot?.startTime ?? '—'}
              </AppText>
            </View>

            <AppInput label="Ad Soyad" value={fullName} onChangeText={setFullName} accessibilityLabel="Ad soyad" />
            <AppInput
              label="Telefon"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              accessibilityLabel="Telefon"
            />
            <AppInput
              label="Kimlik / pasaport no"
              value={identityNumber}
              onChangeText={setIdentityNumber}
              autoCapitalize="characters"
              accessibilityLabel="Kimlik veya pasaport numarası"
            />
            <AppInput
              label="E-posta (opsiyonel)"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              accessibilityLabel="E-posta"
            />
            <AppInput
              label="Not (opsiyonel)"
              value={note}
              onChangeText={setNote}
              multiline
              style={{ minHeight: 72, textAlignVertical: 'top' }}
              accessibilityLabel="Randevu notu"
            />

            <View style={styles.wizardRow}>
              <AppButton label="Geri" variant="ghost" onPress={() => setStep(2)} style={{ flex: 1 }} />
              <AppButton
                label="Randevuyu onayla"
                loading={saving}
                disabled={!canSubmit || saving}
                onPress={submitBooking}
                style={{ flex: 1 }}
              />
            </View>
          </AppCard>
        ) : null}

        <AppCard style={{ backgroundColor: theme.colors.surfaceSoft }}>
          <View style={styles.trustRow}>
            <Ionicons name="shield-checkmark-outline" size={16} color={theme.colors.success} />
            <AppText variant="caption" color={theme.colors.textMuted}>
              Bilgileriniz gizlilik standartlarına uygun işlenir.
            </AppText>
          </View>
        </AppCard>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  hero: {
    borderRadius: 20,
    padding: 18,
    gap: 8,
  },
  progressTrack: {
    marginTop: 6,
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressValue: {
    height: 6,
    borderRadius: 999,
    backgroundColor: palette.primary,
  },
  progressMeta: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  dateRow: { gap: 8, paddingVertical: 8, paddingRight: 10 },
  slot: {
    minWidth: 78,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wizardRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#DCE5F2',
    paddingVertical: 8,
    gap: 10,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
})
