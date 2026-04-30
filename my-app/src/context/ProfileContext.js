import React, { createContext, useContext, useMemo, useState } from "react";

const ProfileContext = createContext(null);

const initialProfile = {
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

export const ProfileProvider = ({ children }) => {
    const [profile, setProfile] = useState(initialProfile);

    const value = useMemo(
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

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error("useProfile must be used within ProfileProvider");
    }
    return context;
};
