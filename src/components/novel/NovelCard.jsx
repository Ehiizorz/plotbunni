import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit3 } from 'lucide-react';

const NovelCard = ({ novel, onOpenNovel, onDeleteNovel, onEditNovel }) => {
  const { t } = useTranslation();
  const { id, name, coverImage } = novel;

  const handleCardClick = () => {
    onOpenNovel(id);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEditNovel(id);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDeleteNovel(id);
  };

  return (
    <Card className="w-full flex flex-col overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 group cursor-pointer h-40">
      <div 
        className="aspect-[2/3] w-full relative overflow-hidden flex-shrink-0"
        onClick={handleCardClick}
      >
        {coverImage ? (
          <img 
            src={coverImage} 
            alt={t('novel_card_cover_alt', { name })}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-500 via-slate-600 to-slate-700" />
        )}
        {/* Icon buttons - revealed on hover */}
        <div className="absolute top-1 right-1 z-10 flex gap-0.5 bg-black/40 p-0.5 rounded-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleEditClick} 
            title={t('novel_card_rename_tooltip')} 
            className="h-6 w-6 p-0 text-white hover:bg-white/20 hover:text-white"
          >
            <Edit3 className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDeleteClick} 
            title={t('novel_card_delete_tooltip')} 
            className="h-6 w-6 p-0 text-white hover:bg-red-500/50 hover:text-white"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      {/* Compact novel name */}
      <div className="flex-grow flex items-center justify-center px-2 py-1 bg-muted/80 min-h-0">
        <h2 
          className="text-xs font-medium text-center truncate text-foreground line-clamp-2" 
          title={name}
        >
          {name || t('novel_card_untitled_novel')}
        </h2>
      </div>
    </Card>
  );
};

export default NovelCard;