import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from './context/DataContext.jsx';
import { useSettings } from './context/SettingsContext.jsx';
import { getAllNovelMetadata } from '@/lib/indexedDb.js';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const ConceptCacheList = lazy(() => import('@/components/concept/ConceptCacheList.jsx'));
const NovelOverviewTab = lazy(() => import('@/components/novel/NovelOverviewTab.jsx'));
const PlanView = lazy(() => import('@/components/plan/PlanView.jsx'));
const SettingsView = lazy(() => import('@/components/settings/SettingsView.jsx'));
const WriteView = lazy(() => import('@/components/write/WriteView.jsx'));
const FontSettingsControl = lazy(() => import('@/components/settings/FontSettingsControl'));
import { Link } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen, Rabbit, Home, Clipboard, Edit, Settings, BookOpen, Lightbulb, Sun, Moon, Text } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function App({ novelId }) {
  const { t } = useTranslation();
  const { isDataLoaded, currentNovelId } = useData();
  const [activeMainTab, setActiveMainTab] = useState("plan");
  const [activeSidebarTab, setActiveSidebarTab] = useState("overview");
  const [currentNovelName, setCurrentNovelName] = useState(t('novel_editor_default_novel_name'));
  const [targetChapterId, setTargetChapterId] = useState(null);
  const [targetSceneId, setTargetSceneId] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const sidebarPanelRef = useRef(null);

  const SIDEBAR_PANEL_ID = "sidebar-panel";

  const { themeMode, activeOsTheme, setThemeMode } = useSettings();

  const toggleSidebar = () => {
    if (sidebarPanelRef.current) {
      if (isSidebarCollapsed) {
        sidebarPanelRef.current.expand();
      } else {
        sidebarPanelRef.current.collapse();
      }
    }
  };

  useEffect(() => {
    if (novelId) {
      const fetchNovelName = async () => {
        try {
          const allMeta = await getAllNovelMetadata();
          const currentMeta = allMeta.find(m => m.id === novelId);
          if (currentMeta) {
            setCurrentNovelName(currentMeta.name);
          } else {
            setCurrentNovelName(t('novel_editor_novel_not_found'));
          }
        } catch (error) {
          console.error("Failed to fetch novel name:", error);
          setCurrentNovelName(t('novel_editor_default_novel_name'));
        }
      };
      fetchNovelName();
    } else {
      setCurrentNovelName(t('novel_editor_default_novel_name'));
    }
  }, [novelId, t]);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setActiveMainTab("overview");
    }
  }, []);

  const effectiveTheme = themeMode === 'system' ? activeOsTheme : themeMode;

  const handleThemeToggle = () => {
    const nextTheme = effectiveTheme === 'light' ? 'dark' : 'light';
    setThemeMode(nextTheme);
  };

  const handleSwitchToWriteTab = (chapterId, sceneId = null) => {
    setActiveMainTab('write');
    setTargetChapterId(chapterId);
    setTargetSceneId(sceneId);
    setTimeout(() => {
      setTargetChapterId(null);
      setTargetSceneId(null);
    }, 100);
  };

  if (!isDataLoaded || currentNovelId !== novelId) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-background">
        <Rabbit className="h-10 w-10 animate-pulse text-primary mb-3" />
        <p className="text-base text-muted-foreground">{t('novel_editor_loading_data')}</p>
      </div>
    );
  }

  const renderRightPaneContent = () => {
    switch (activeMainTab) {
      case "write":
        return <WriteView targetChapterId={targetChapterId} targetSceneId={targetSceneId} />;
      case "plan":
        return <PlanView onSwitchToWriteTab={handleSwitchToWriteTab} novelId={novelId} />;
      case "settings":
        return <SettingsView />;
      default:
        return <PlanView onSwitchToWriteTab={handleSwitchToWriteTab} novelId={novelId} />;
    }
  };

  const renderMobileContent = () => {
    switch (activeMainTab) {
      case "overview":
        return <NovelOverviewTab />;
      case "concepts":
        return <ConceptCacheList />;
      case "write":
        return <WriteView targetChapterId={targetChapterId} targetSceneId={targetSceneId} />;
      case "plan":
        return <PlanView onSwitchToWriteTab={handleSwitchToWriteTab} novelId={novelId} />;
      case "settings":
        return <SettingsView />;
      default:
        return <PlanView onSwitchToWriteTab={handleSwitchToWriteTab} novelId={novelId} />;
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Compact Header */}
      <header className="flex items-center justify-between px-3 py-2 border-b bg-background shadow-sm print:hidden">
        <div className="flex items-center min-w-0 gap-2">
          <Link to="/" className="p-1.5 rounded-md hover:bg-muted flex-shrink-0" title={t('back_to_novels')}>
            <Home className="h-4 w-4 text-foreground" />
          </Link>

          {isSidebarCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="hidden md:flex mr-1 flex-shrink-0 h-8 w-8 p-0"
              title={t('novel_editor_show_sidebar_tooltip')}
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          )}
          
          <h1 className="text-sm font-semibold truncate min-w-0 flex items-center">
            <span className="truncate">{currentNovelName || t('app_title')}</span>
            <Rabbit className="h-4 w-4 ml-1.5 flex-shrink-0" />
          </h1>
          
          <Tabs
            value={activeMainTab}
            onValueChange={setActiveMainTab}
            className="w-auto ml-3 flex-shrink-0"
          >
            <TabsList className="justify-start h-8">
              <TabsTrigger value="overview" className="md:hidden p-1.5 text-xs" title={t('novel_editor_overview_tab')}>
                <BookOpen className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="concepts" className="md:hidden p-1.5 text-xs" title={t('novel_editor_concepts_tab_mobile_tooltip')} data-joyride="concepts-tab">
                <Lightbulb className="h-4 w-4" />
              </TabsTrigger>

              <TabsTrigger value="plan" className="text-xs md:text-sm p-1.5 md:px-3 md:py-1.5" title={t('novel_editor_plan_tab')} data-joyride="plan-tab">
                <Clipboard className="h-3.5 w-3.5 md:mr-1.5" />
                <span className="hidden md:inline">{t('novel_editor_plan_tab')}</span>
              </TabsTrigger>
              <TabsTrigger value="write" className="text-xs md:text-sm p-1.5 md:px-3 md:py-1.5" title={t('novel_editor_write_tab')} data-joyride="write-tab">
                <Edit className="h-3.5 w-3.5 md:mr-1.5" />
                <span className="hidden md:inline">{t('novel_editor_write_tab')}</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs md:text-sm p-1.5 md:px-3 md:py-1.5" title={t('novel_editor_settings_tab')} data-joyride="settings-tab">
                <Settings className="h-3.5 w-3.5 md:mr-1.5" />
                <span className="hidden md:inline">{t('novel_editor_settings_tab')}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="hidden md:inline-flex h-8 w-8 p-0" title={t('novel_editor_font_settings_tooltip')}>
                <Text className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" side="bottom" align="end">
              <Suspense fallback={null}>
                <FontSettingsControl />
              </Suspense>
            </PopoverContent>
          </Popover>

          <Button variant="ghost" size="sm" onClick={handleThemeToggle} className="h-8 w-8 p-0" title={effectiveTheme === 'light' ? t('theme_toggle_tooltip_light') : t('theme_toggle_tooltip_dark')}>
            {effectiveTheme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* Desktop: Two-Pane Layout */}
      <div className="hidden md:flex flex-grow border-t">
        <ResizablePanelGroup 
          direction="horizontal" 
          className="flex-grow"
        >
          <ResizablePanel
            id={SIDEBAR_PANEL_ID}
            ref={sidebarPanelRef}
            defaultSize={30}
            minSize={15}
            maxSize={50}
            collapsible={true}
            collapsedSize={0}
            onCollapse={() => setIsSidebarCollapsed(true)}
            onExpand={() => setIsSidebarCollapsed(false)}
            className="transition-all duration-200 ease-in-out"
          >
            {!isSidebarCollapsed && (
              <div className="flex flex-col h-full">
                <Tabs value={activeSidebarTab} onValueChange={setActiveSidebarTab} className="flex flex-col h-full">
                  <div className="flex items-center shrink-0 border-b">
                    <TabsList className="shrink-0 rounded-none flex-grow h-9">
                      <TabsTrigger value="overview" className="flex-1 rounded-none text-xs py-1.5">
                        <BookOpen className="mr-1.5 h-3.5 w-3.5" />{t('novel_editor_overview_tab')}
                      </TabsTrigger>
                      <TabsTrigger value="concepts" className="flex-1 rounded-none text-xs py-1.5" data-joyride="concepts-tab-desktop">
                        <Lightbulb className="mr-1.5 h-3.5 w-3.5" />{t('novel_editor_concept_cache_tab')}
                      </TabsTrigger>
                    </TabsList>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleSidebar}
                      className="hidden md:flex mx-0.5 flex-shrink-0 h-8 w-8 p-0"
                      title={t('novel_editor_hide_sidebar_tooltip')}
                    >
                      <PanelLeftClose className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="relative flex-grow">
                    <Suspense fallback={<div className="flex items-center justify-center h-full p-2 text-xs">Loading…</div>}>
                    <TabsContent
                      value="overview"
                      className="absolute inset-0 p-0 m-0"
                      forceMount={activeSidebarTab === "overview"}
                    >
                      <NovelOverviewTab />
                    </TabsContent>
                    
                    <TabsContent 
                      value="concepts" 
                      className="absolute inset-0 p-0 m-0"
                      forceMount={activeSidebarTab === "concepts"}
                    >
                      <ConceptCacheList />
                    </TabsContent>
                    </Suspense>
                  </div>
                </Tabs>
              </div>
            )}
          </ResizablePanel>
          <ResizableHandle withHandle className={isSidebarCollapsed ? "hidden" : ""} />
          <ResizablePanel defaultSize={70} className="flex flex-col h-full">
            <ScrollArea className="h-full">
              <Suspense fallback={<div className="flex items-center justify-center h-full p-4 text-xs">Loading…</div>}>
                {renderRightPaneContent()}
              </Suspense>
            </ScrollArea>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile: Single Pane Layout */}
      <div className="md:hidden flex-grow border-t">
        <ScrollArea className="h-full">
          <Suspense fallback={<div className="flex items-center justify-center h-full p-4 text-xs">Loading…</div>}>
            {renderMobileContent()}
          </Suspense>
        </ScrollArea>
      </div>
    </div>
  );
}

export default App;