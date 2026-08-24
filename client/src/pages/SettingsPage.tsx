import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from './AppLayout';
import { useProfileStore } from '../store/profileStore';
import { LanguageCode } from '../api/types';
import { Card, CardContent } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const LANGUAGE_OPTIONS: { value: LanguageCode; label: string }[] = [
  { value: 'he', label: 'עברית' },
  { value: 'en', label: 'English' },
];

const SAVED_MESSAGE_DELAY_MS = 600;

export const SettingsPage = () => {
  const { t } = useTranslation();
  const profile = useProfileStore((s) => s.profile);
  const isLoading = useProfileStore((s) => s.isLoading);
  const updateLanguage = useProfileStore((s) => s.updateLanguage);

  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode | null>(
    (profile?.language as LanguageCode) ?? null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  // profile can still be null on mount (e.g. a direct load/refresh of this
  // page), so the useState initializer above may miss it — sync once it arrives.
  useEffect(() => {
    if (profile && selectedLanguage === null) {
      setSelectedLanguage(profile.language as LanguageCode);
    }
  }, [profile, selectedLanguage]);

  const hasChanges = profile != null && selectedLanguage !== null && selectedLanguage !== profile.language;

  const handleLanguageSelect = (language: LanguageCode) => {
    setSelectedLanguage(language);
    setSaveError(null);
    setJustSaved(false);
  };

  const handleSave = async () => {
    if (selectedLanguage === null) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await updateLanguage(selectedLanguage);
      setJustSaved(true);
      setTimeout(() => {
        window.location.reload();
      }, SAVED_MESSAGE_DELAY_MS);
    } catch (error) {
      console.error('Failed to update language', error);
      setSaveError(t('settings.saveError'));
      setIsSaving(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-md p-4 sm:p-6">
        <h1 className="mb-4 text-2xl font-bold">{t('settings.title')}</h1>
        <Card>
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex flex-col gap-1">
              <Label>{t('settings.nameLabel')}</Label>
              <p className="text-sm text-muted-foreground">
                {profile.firstName} {profile.lastName}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <Label>{t('settings.emailLabel')}</Label>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>

            <Separator />

            <div className="flex flex-col gap-1">
              <Label htmlFor="language-select">{t('settings.languageLabel')}</Label>
              <Select
                value={selectedLanguage ?? profile.language}
                disabled={isSaving}
                onValueChange={handleLanguageSelect}
              >
                <SelectTrigger id="language-select" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="mt-2 flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={!hasChanges || isSaving}
                  aria-busy={isSaving}
                  onClick={handleSave}
                >
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t('common.save')}
                </Button>
              </div>
              <div aria-live="polite" className="text-sm">
                {justSaved && <span className="text-muted-foreground">{t('settings.savedMessage')}</span>}
                {saveError && <span className="text-destructive">{saveError}</span>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};
