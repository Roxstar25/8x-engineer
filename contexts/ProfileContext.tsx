import React, { createContext, useContext, useEffect, useState } from 'react'
import { loadUserProfile, saveUserProfile, type UserProfile } from '@/lib/storage'

interface ProfileContextValue {
  profile: UserProfile | null
  ready: boolean
  setProfile: (profile: UserProfile) => Promise<void>
}

const ProfileContext = createContext<ProfileContextValue>({
  profile: null,
  ready: false,
  setProfile: async () => {},
})

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    loadUserProfile().then((p) => {
      setProfileState(p)
      setReady(true)
    })
  }, [])

  const setProfile = async (next: UserProfile) => {
    setProfileState(next)
    await saveUserProfile(next)
  }

  return (
    <ProfileContext.Provider value={{ profile, ready, setProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  return useContext(ProfileContext)
}
