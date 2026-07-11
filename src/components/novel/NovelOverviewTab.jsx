import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useData } from '../../context/DataContext';
import { updateNovelMetadata, getAllNovelMetadata } from '../../lib/indexedDb';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../ui/collapsible';
import { ChevronDown, ChevronUp, UploadCloud, WandSparkles, Download } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { AISuggestionModal } from '../ai/AISuggestionModal';
import { ExportModal } from './ExportModal';
import { useSettings } from '../../context/SettingsContext';
import { generateContextWithRetry } from '../../lib/aiContextUtils';

const NovelOverviewTab = () => {
  const { t } = useTranslation();
  const {
    novelId: currentNovelIdFromAppContext,
    authorName, 
    synopsis, 
    coverImage,
    pointOfView,
    genre,
    timePeriod,
    targetAudience,
    themes,
    tone,
    updateNovelDetails,
    currentNovelId: novelIdFromData,
    concepts,
    acts,
    chapters,
    scenes,
    actOrder,
    isDataLoaded
  } = useData();
  const novelId = currentNovelIdFromAppContext || novelIdFromData;

  const [localNovelName, setLocalNovelName] = useState('');
  const [localAuthorName, setLocalAuthorName] = useState('');
  const [localSynopsis, setLocalSynopsis] = useState('');
  const [localCoverImage, setLocalCoverImage] = useState(null);
  const [localPointOfView, setLocalPointOfView] = useState('');
  const [localGenre, setLocalGenre] = useState('');
  const [localTimePeriod, setLocalTimePeriod] = useState('');
  const [localTargetAudience, setLocalTargetAudience] = useState('');
  const [localThemes, setLocalThemes] = useState('');
  const [localTone, setLocalTone] = useState('');
  const [originalNovelName, setOriginalNovelName] = useState('');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const fileInputRef = useRef(null);
  const { toast } = useToast();
  const { 
    systemPrompt, 
    taskSettings, 
    TASK_KEYS, 
    themeMode, 
    activeOsTheme, 
    endpointProfiles, 
    activeProfileId,
    showAiFeatures
  } = useSettings();
  const [isAISuggestionModalOpen, setIsAISuggestionModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const [aiSynopsisContext, setAiSynopsisContext] = useState({
    contextString: "",
    estimatedTokens: 0,
    level: 0,
    error: null,
  });

  const fileInputRef2 = useRef(null);
  const dropZoneRef = useRef(null);
  const isMounted = useRef(false);

  const triggerFileUpload = () => {
    fileInputRef2.current?.click();
  };

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (novelId) {
      const fetchMetadata = async () => {
        const allMeta = await getAllNovelMetadata();
        const currentMeta = allMeta.find(m => m.id === novelId);
        if (currentMeta) {
          setLocalNovelName(currentMeta.name);
          setOriginalNovelName(currentMeta.name);
        }
      };
      fetchMetadata();
    }
    setLocalAuthorName(authorName || '');
    setLocalSynopsis(synopsis || '');
    setLocalCoverImage(coverImage || null);
    setLocalPointOfView(pointOfView || '');
    setLocalGenre(genre || '');
    setLocalTimePeriod(timePeriod || '');
    setLocalTargetAudience(targetAudience || '');
    setLocalThemes(themes || '');
    setLocalTone(tone || '');
    setAiSynopsisContext({ contextString: "", estimatedTokens: 0, level: 0, error: null });
  }, [novelId, authorName, synopsis, coverImage, pointOfView, genre, timePeriod, targetAudience, themes, tone]);

  const handleSaveChanges = useCallback(async () => {
    if (!updateNovelDetails) return;
    
    const changes = {};
    if (localAuthorName !== authorName) changes.authorName = localAuthorName;
    if (localSynopsis !== synopsis) changes.synopsis = localSynopsis;
    if (localCoverImage !== coverImage) changes.coverImage = localCoverImage;
    if (localPointOfView !== pointOfView) changes.pointOfView = localPointOfView;
    if (localGenre !== genre) changes.genre = localGenre;
    if (localTimePeriod !== timePeriod) changes.timePeriod = localTimePeriod;
    if (localTargetAudience !== targetAudience) changes.targetAudience = localTargetAudience;
    if (localThemes !== themes) changes.themes = localThemes;
    if (localTone !== tone) changes.tone = localTone;

    if (Object.keys(changes).length > 0) {
      try {
        updateNovelDetails(changes);
        if (localNovelName !== originalNovelName) {
          await updateNovelMetadata(novelId, { name: localNovelName });
          setOriginalNovelName(localNovelName);
        }
        toast({
          title: t('save_successful_title'),
          description: t('novel_overview_changes_saved'),
        });
      } catch (error) {
        console.error("Error saving changes:", error);
        toast({
          title: t('save_error_title'),
          description: t('save_error_description'),
          variant: "destructive",
        });
      }
    }
  }, [localAuthorName, localSynopsis, localCoverImage, localPointOfView, localGenre, localTimePeriod, localTargetAudience, localThemes, localTone, localNovelName, originalNovelName, authorName, synopsis, coverImage, pointOfView, genre, timePeriod, targetAudience, themes, tone, novelId, updateNovelDetails, toast, t]);

  const handleCoverImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (isMounted.current) {
          setLocalCoverImage(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const generateAiSynopsis = async () => {
    setIsAISuggestionModalOpen(true);

    try {
      const context = await generateContextWithRetry(concepts, acts, chapters, scenes, actOrder, "level1");
      setAiSynopsisContext({
        contextString: context,
        estimatedTokens: Math.ceil(context.split(/\s+/).length * 1.3),
        level: 1,
        error: null,
      });
    } catch (error) {
      if (isMounted.current) {
        console.error("Error generating context:", error);
        setAiSynopsisContext((prev) => ({
          ...prev,
          error: error.message || "Failed to generate context",
        }));
      }
    }
  };

  return (
    <>
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="p-3 max-w-2xl">
          {/* Cover Image */}
          <Card className="mb-3 shadow-sm">
            <CardHeader className="p-3">
              <CardTitle className="text-sm">{t('novel_overview_cover_image_label')}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="flex gap-2 items-center">
                {localCoverImage && (
                  <img src={localCoverImage} alt="Cover" className="w-16 h-24 object-cover rounded-sm" />
                )}
                <Button variant="outline" size="sm" onClick={triggerFileUpload} className="text-xs h-8">
                  <UploadCloud className="h-3 w-3 mr-1.5" />
                  {t('novel_overview_upload_cover_button')}
                </Button>
              </div>
              <input
                type="file"
                ref={fileInputRef2}
                onChange={handleCoverImageUpload}
                accept="image/*"
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* Novel Name & Author */}
          <Card className="mb-3 shadow-sm">
            <CardHeader className="p-3">
              <CardTitle className="text-sm">{t('novel_overview_details_label')}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
              <div>
                <Label className="text-xs mb-1 block">{t('novel_name_label')}</Label>
                <Input
                  value={localNovelName}
                  onChange={(e) => setLocalNovelName(e.target.value)}
                  placeholder={t('novel_name_placeholder')}
                  className="text-xs h-7"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">{t('novel_overview_author_name_label')}</Label>
                <Input
                  value={localAuthorName}
                  onChange={(e) => setLocalAuthorName(e.target.value)}
                  placeholder={t('novel_overview_author_name_placeholder')}
                  className="text-xs h-7"
                />
              </div>
            </CardContent>
          </Card>

          {/* Synopsis */}
          <Card className="mb-3 shadow-sm">
            <CardHeader className="p-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm">{t('novel_overview_synopsis_label')}</CardTitle>
                {showAiFeatures && (
                  <Button variant="ghost" size="sm" onClick={generateAiSynopsis} className="h-7 w-7 p-0" title={t('novel_overview_generate_synopsis_button')}>
                    <WandSparkles className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <Textarea
                value={localSynopsis}
                onChange={(e) => setLocalSynopsis(e.target.value)}
                placeholder={t('novel_overview_synopsis_placeholder')}
                className="text-xs min-h-20 resize-none"
              />
            </CardContent>
          </Card>

          {/* Additional Details - Collapsible */}
          <Card className="mb-3 shadow-sm">
            <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
              <CollapsibleTrigger asChild>
                <button className="w-full p-3 flex justify-between items-center hover:bg-muted/50 rounded-t-lg">
                  <CardTitle className="text-sm">{t('novel_overview_details_label')}</CardTitle>
                  {isDetailsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="p-3 pt-0 space-y-2 border-t">
                <div>
                  <Label className="text-xs mb-1 block">{t('novel_overview_pov_label')}</Label>
                  <Input
                    value={localPointOfView}
                    onChange={(e) => setLocalPointOfView(e.target.value)}
                    placeholder={t('novel_overview_pov_placeholder')}
                    className="text-xs h-7"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">{t('novel_overview_genre_label')}</Label>
                  <Input
                    value={localGenre}
                    onChange={(e) => setLocalGenre(e.target.value)}
                    placeholder={t('novel_overview_genre_placeholder')}
                    className="text-xs h-7"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">{t('novel_overview_time_period_label')}</Label>
                  <Input
                    value={localTimePeriod}
                    onChange={(e) => setLocalTimePeriod(e.target.value)}
                    placeholder={t('novel_overview_time_period_placeholder')}
                    className="text-xs h-7"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">{t('novel_overview_target_audience_label')}</Label>
                  <Input
                    value={localTargetAudience}
                    onChange={(e) => setLocalTargetAudience(e.target.value)}
                    placeholder={t('novel_overview_target_audience_placeholder')}
                    className="text-xs h-7"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">{t('novel_overview_themes_label')}</Label>
                  <Input
                    value={localThemes}
                    onChange={(e) => setLocalThemes(e.target.value)}
                    placeholder={t('novel_overview_themes_placeholder')}
                    className="text-xs h-7"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">{t('novel_overview_tone_label')}</Label>
                  <Input
                    value={localTone}
                    onChange={(e) => setLocalTone(e.target.value)}
                    placeholder={t('novel_overview_tone_placeholder')}
                    className="text-xs h-7"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Export & Save Buttons */}
          <div className="flex gap-2 mb-3">
            <Button onClick={handleSaveChanges} className="flex-1 text-xs h-8">
              {t('novel_overview_save_changes_button')}
            </Button>
            <Button onClick={() => setIsExportModalOpen(true)} variant="outline" className="text-xs h-8">
              <Download className="h-3 w-3 mr-1.5" />
              {t('novel_overview_export_button')}
            </Button>
          </div>
        </div>
      </ScrollArea>

      <AISuggestionModal
        open={isAISuggestionModalOpen}
        onOpenChange={setIsAISuggestionModalOpen}
        title={t('novel_overview_ai_synopsis_title')}
        prompt={t('novel_overview_ai_synopsis_prompt', { novelName: localNovelName })}
        context={aiSynopsisContext.contextString}
        estimatedTokens={aiSynopsisContext.estimatedTokens}
        onSuggestion={(suggestion) => setLocalSynopsis(suggestion)}
      />

      <ExportModal
        open={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
      />
    </>
  );
};

export default NovelOverviewTab;