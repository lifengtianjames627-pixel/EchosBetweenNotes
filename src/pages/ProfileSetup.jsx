import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import SetupHeader from '@/components/setup/SetupHeader';
import MusicPreferences from '@/components/setup/MusicPreferences';
import ProfileEssentials from '@/components/setup/ProfileEssentials';
import ConnectionChoices from '@/components/setup/ConnectionChoices';
import SetupSubmit from '@/components/setup/SetupSubmit';

export default function ProfileSetup() {
  const navigate = useNavigate(); const queryClient = useQueryClient(); const { updateCurrentUser } = useAuth();
  const [preferences, setPreferences] = useState([]); const [biography, setBiography] = useState('');
  const [locationAllowed, setLocationAllowed] = useState(false); const [hasBand, setHasBand] = useState(false); const [bandName, setBandName] = useState('');
  const save = useMutation({ mutationFn: () => updateCurrentUser({ music_preferences: preferences, biography, location_network_allowed: locationAllowed, has_band: hasBand, band_name: hasBand ? bandName : '', profile_completed: true }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['me'] }); navigate('/profile', { replace: true }); } });
  const toggle = item => setPreferences(items => items.includes(item) ? items.filter(x => x !== item) : [...items, item]);
  const change = (key, value) => { if (key === 'location') setLocationAllowed(value); if (key === 'band') setHasBand(value); if (key === 'bandName') setBandName(value); };
  return <div className="min-h-screen px-4 py-12" style={{ background: 'radial-gradient(ellipse at 50% 0%, #182052 0%, #070910 56%, #020304 100%)' }}><div className="max-w-xl mx-auto"><SetupHeader /><form onSubmit={e => { e.preventDefault(); save.mutate(); }} className="rounded-3xl p-5 sm:p-7" style={{ background: 'rgba(8,11,29,0.82)', border: '1px solid rgba(124,111,255,0.22)', boxShadow: '0 24px 60px rgba(0,0,0,0.32)' }}><MusicPreferences values={preferences} onToggle={toggle} /><ProfileEssentials biography={biography} onChange={setBiography} /><ConnectionChoices locationAllowed={locationAllowed} hasBand={hasBand} bandName={bandName} onChange={change} /><SetupSubmit pending={save.isPending} /></form></div></div>;
}