import React, { createContext, useContext, useMemo, useState, ReactNode } from "react";

interface Auth {
  name: string;
  email: string;
  password: string;
  location: string;
}

interface Documents {
  aadhaar: boolean;
  doc1: boolean;
  doc2: boolean;
}

interface Details {
  country: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
}

interface Profile {
  auth: Auth;
  roleType: string;
  roleTitle: string;
  documents: Documents;
  languages: string[];
  skills: string[];
  bio: string;
  hourlyRate: string;
  details: Details;
}

interface ProfileContextType {
  profile: Profile;
  setAuth: (updates: Partial<Auth>) => void;
  setRoleType: (roleType: string) => void;
  setRoleTitle: (roleTitle: string) => void;
  toggleDocument: (key: keyof Documents) => void;
  addLanguage: (language: string) => void;
  removeLanguage: (language: string) => void;
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
  setBio: (bio: string) => void;
  setHourlyRate: (rate: string) => void;
  setDetails: (updates: Partial<Details>) => void;
  resetProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

const initialProfile: Profile = {
  auth: {
    name: "",
    email: "",
    password: "",
    location: "",
  },
  roleType: "",
  roleTitle: "",
  documents: {
    aadhaar: false,
    doc1: false,
    doc2: false,
  },
  languages: [],
  skills: [],
  bio: "",
  hourlyRate: "",
  details: {
    country: "India",
    addressLine1: "",
    addressLine2: "",
    city: "",
  },
};

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<Profile>(initialProfile);

  const value = useMemo<ProfileContextType>(
    () => ({
      profile,
      setAuth: (updates) =>
        setProfile((prev) => ({
          ...prev,
          auth: { ...prev.auth, ...updates },
        })),
      setRoleType: (roleType) => setProfile((prev) => ({ ...prev, roleType })),
      setRoleTitle: (roleTitle) => setProfile((prev) => ({ ...prev, roleTitle })),
      toggleDocument: (key) =>
        setProfile((prev) => ({
          ...prev,
          documents: {
            ...prev.documents,
            [key]: !prev.documents[key],
          },
        })),
      addLanguage: (language) =>
        setProfile((prev) =>
          prev.languages.includes(language)
            ? prev
            : { ...prev, languages: [...prev.languages, language] }
        ),
      removeLanguage: (language) =>
        setProfile((prev) => ({
          ...prev,
          languages: prev.languages.filter((item) => item !== language),
        })),
      addSkill: (skill) =>
        setProfile((prev) =>
          prev.skills.includes(skill)
            ? prev
            : { ...prev, skills: [...prev.skills, skill] }
        ),
      removeSkill: (skill) =>
        setProfile((prev) => ({
          ...prev,
          skills: prev.skills.filter((item) => item !== skill),
        })),
      setBio: (bio) => setProfile((prev) => ({ ...prev, bio })),
      setHourlyRate: (rate) => setProfile((prev) => ({ ...prev, hourlyRate: rate })),
      setDetails: (updates) =>
        setProfile((prev) => ({
          ...prev,
          details: { ...prev.details, ...updates },
        })),
      resetProfile: () => setProfile(initialProfile),
    }),
    [profile]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within ProfileProvider");
  }
  return context;
};