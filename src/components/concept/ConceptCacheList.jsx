import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '@/context/DataContext';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { NotebookText, PlusCircle, Filter, Copy, Trash2 } from 'lucide-react';
import ConceptFormModal from './ConceptFormModal';
import CreateConceptModal from './CreateConceptModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { createConcept } from '@/data/models';

const ConceptCacheList = () => {
  const { t } = useTranslation();
  const { concepts, conceptTemplates, addConcept, deleteConcept } = useData();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [conceptToEdit, setConceptToEdit] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [conceptIdToDelete, setConceptIdToDelete] = useState(null);

  const handleDuplicateConcept = (conceptToDuplicate) => {
    const newName = `${conceptToDuplicate.name} ${t('concept_cache_duplicate_suffix')}`;
    const { 
      id: _oldId, 
      creation_date: _oldCreationDate, 
      last_modified_date: _oldLastModifiedDate,
      ...restOfConceptToDuplicate 
    } = conceptToDuplicate;

    const duplicatedConcept = createConcept({
      ...restOfConceptToDuplicate,
      name: newName,
    });
    addConcept(duplicatedConcept);
  };

  const handleDeleteConcept = (conceptId) => {
    setConceptIdToDelete(conceptId);
    setIsConfirmModalOpen(true);
  };

  const executeDeleteConcept = () => {
    if (deleteConcept && conceptIdToDelete) {
      deleteConcept(conceptIdToDelete);
    }
    setConceptIdToDelete(null);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const filteredConcepts = concepts.filter(concept =>
    concept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (concept.tags && concept.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) ||
    (concept.aliases && concept.aliases.some(alias => alias.toLowerCase().includes(searchTerm.toLowerCase()))) ||
    (concept.description && concept.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const groupedConcepts = filteredConcepts.reduce((acc, concept) => {
    let templateType = t('concept_cache_default_group_name');

    if (conceptTemplates && concept.tags && concept.tags.length > 0) {
      const matchingNovelTemplate = conceptTemplates.find(novelTemplate => 
        novelTemplate.templateData && 
        novelTemplate.templateData.tags && 
        novelTemplate.templateData.tags.length > 0 &&
        concept.tags.includes(novelTemplate.templateData.tags[0])
      );
      if (matchingNovelTemplate) {
        templateType = matchingNovelTemplate.name;
      }
    }
    
    if (!acc[templateType]) {
      acc[templateType] = [];
    }
    acc[templateType].push(concept);
    return acc;
  }, {});

  const sortedGroupKeys = Object.keys(groupedConcepts).sort((a, b) => {
    if (a === t('concept_cache_default_group_name')) return 1;
    if (b === t('concept_cache_default_group_name')) return -1;
    return a.localeCompare(b);
  });

  return (
    <>
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="p-3">
          {/* Compact Header */}
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-semibold text-foreground">{t('concept_cache_title')}</h2>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => console.log("Filter clicked")} className="h-7 w-7 p-0" title={t('concept_cache_tooltip_filter_not_implemented')}>
                <Filter className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsCreateModalOpen(true)} className="h-7 w-7 p-0" title={t('concept_cache_tooltip_create_new')}>
                <PlusCircle className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          
          {/* Search Bar */}
          <Input
            type="text"
            placeholder={t('concept_cache_placeholder_search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs h-7 mb-2"
          />
          
          {/* Concepts List */}
          {filteredConcepts && filteredConcepts.length > 0 ? (
            sortedGroupKeys.map(groupKey => (
              <div key={groupKey}>
                {/* Group Header */}
                <div className="px-1 py-1.5 mt-2 mb-1 text-xs font-medium text-muted-foreground border-b border-border">
                  {groupKey}
                </div>
                
                {/* Concepts */}
                {groupedConcepts[groupKey].map(concept => (
                  <div
                    key={concept.id}
                    className="p-1.5 mb-0.5 rounded-sm hover:bg-muted flex items-center text-xs text-foreground group cursor-pointer transition-colors duration-150"
                    onClick={() => {
                      setConceptToEdit(concept);
                      setIsEditModalOpen(true);
                    }}
                  >
                    {concept.image ? (
                      <img src={concept.image} alt={concept.name} className="w-5 h-5 mr-1.5 object-cover rounded-sm flex-shrink-0" />
                    ) : (
                      <NotebookText className="w-5 h-5 mr-1.5 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className="truncate flex-1 min-w-0">{concept.name}</span>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-primary/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateConcept(concept);
                        }}
                        title={t('concept_cache_tooltip_duplicate_concept', { conceptName: concept.name })}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConcept(concept.id);
                        }}
                        title={t('concept_cache_tooltip_delete_concept', { conceptName: concept.name })}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <p className="p-2 text-xs text-muted-foreground">{t('concept_cache_no_concepts_message')}</p>
          )}
        </div>
      </ScrollArea>
      
      <CreateConceptModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />

      {conceptToEdit && (
        <ConceptFormModal
          open={isEditModalOpen}
          onOpenChange={(isOpen) => {
            setIsEditModalOpen(isOpen);
            if (!isOpen) {
              setConceptToEdit(null);
            }
          }}
          conceptToEdit={conceptToEdit}
        />
      )}

      <ConfirmModal
        open={isConfirmModalOpen}
        onOpenChange={setIsConfirmModalOpen}
        title={t('concept_cache_confirm_delete_title')}
        description={t('concept_cache_confirm_delete_description')}
        onConfirm={executeDeleteConcept}
        confirmText={t('delete')}
        cancelText={t('cancel')}
      />
    </>
  );
};

export default ConceptCacheList;