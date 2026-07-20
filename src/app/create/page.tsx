'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateProject, useProjectDetails } from '@/features/projects/hooks';
import { useTriggerRender } from '@/features/render/hooks';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import MediaUploader from '@/components/upload/MediaUploader';
import AudioUploader from '@/components/upload/AudioUploader';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Video,
  Music,
  Sliders,
  Play,
  Check,
} from 'lucide-react';

const detailsSchema = z.object({
  title: z.string().min(3, { message: 'Project title must be at least 3 characters' }),
  description: z.string().min(5, { message: 'Description must be at least 5 characters' }),
});

type DetailsFormValues = z.infer<typeof detailsSchema>;

export default function CreateProjectWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [projectId, setProjectId] = useState<string | null>(null);

  // TanStack Queries & Mutations
  const { mutate: createProject, isPending: isCreating } = useCreateProject();
  const { data: projectDetails } = useProjectDetails(projectId || '');
  const { mutate: triggerRender, isPending: isRendering } = useTriggerRender();

  // Form setups
  const {
    register: registerDetails,
    handleSubmit: handleSubmitDetails,
    formState: { errors: detailsErrors },
  } = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  // Step 4 Settings Form
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState<15 | 30 | 60>(30);
  const [style, setStyle] = useState('cinematic');
  const [captionStyle, setCaptionStyle] = useState('hormozi');
  const [addSubtitles, setAddSubtitles] = useState(true);
  const [addStickers, setAddStickers] = useState(true);
  const [addTextOverlay, setAddTextOverlay] = useState(true);

  const steps = [
    { number: 1, title: 'Project Details', icon: Video },
    { number: 2, title: 'Upload Media', icon: Video },
    { number: 3, title: 'Soundtrack', icon: Music },
    { number: 4, title: 'AI Generation', icon: Sliders },
  ];

  // Submit Step 1
  const onDetailsSubmit = (data: DetailsFormValues) => {
    createProject(data, {
      onSuccess: (newProject) => {
        setProjectId(newProject.id);
        toast.success('Project created. Please upload raw clips.');
        setCurrentStep(2);
      },
    });
  };

  // Trigger rendering from Step 4
  const handleStartGeneration = () => {
    if (!projectId) return;

    if (!prompt.trim()) {
      toast.error('Please write an AI prompt instruction first.');
      return;
    }

    triggerRender(
      {
        projectId,
        data: {
          prompt,
          output_filename: 'final_output.mp4',
          target_duration: duration,
          aspect_ratio: '9:16', // Default standard vertical format
          style,
          caption_style: captionStyle,
          add_subtitle: addSubtitles,
          add_stickers: addStickers,
          add_textoverlay: addTextOverlay,
        },
      },
      {
        onSuccess: () => {
          toast.success('AI generation pipeline successfully started');
          router.push(`/editor/${projectId}`);
        },
      }
    );
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Step 1 goes through form submission
      return;
    }

    // Step 2 validation (must upload at least 1 file)
    if (currentStep === 2) {
      const mediaCount = projectDetails?.media?.length || 0;
      if (mediaCount === 0) {
        toast.error('Please upload at least one video or photo clip to proceed.');
        return;
      }
    }

    // Move next
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6">
      {/* Headings */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Create AI Project</h2>
        <p className="text-zinc-400 text-sm max-w-md mx-auto">
          Initialize details, upload clips, and configure editing parameters.
        </p>
      </div>

      {/* Stepper Header */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 shadow-md flex items-center justify-between gap-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;

          return (
            <React.Fragment key={step.number}>
              <div className="flex items-center gap-3">
                <div
                  className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs border transition-all duration-300 ${
                    isActive
                      ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20 scale-105'
                      : isCompleted
                      ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                  }`}
                >
                  {isCompleted ? <Check className="h-4.5 w-4.5" /> : step.number}
                </div>
                <div className="hidden sm:block text-left">
                  <p
                    className={`text-xs font-semibold uppercase tracking-wider ${
                      isActive ? 'text-zinc-200' : 'text-zinc-500'
                    }`}
                  >
                    Step {step.number}
                  </p>
                  <p
                    className={`text-xs font-bold ${
                      isActive ? 'text-purple-400' : isCompleted ? 'text-emerald-500/80' : 'text-zinc-500'
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-[2px] hidden sm:block ${isCompleted ? 'bg-emerald-500/10' : 'bg-zinc-850'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Contents */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md rounded-3xl p-8 shadow-xl shadow-black/40 min-h-[380px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
          >
            {/* Step 1: Details */}
            {currentStep === 1 && (
              <form id="details-form" onSubmit={handleSubmitDetails(onDetailsSubmit)} className="space-y-6">
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-zinc-100">Project Details</h3>
                  <p className="text-xs text-zinc-400">Give your video project a title and context description.</p>
                </div>

                <div className="space-y-5">
                  <Input
                    label="Project Title"
                    placeholder="e.g. Bali Summer Travel Reel"
                    error={detailsErrors.title?.message}
                    disabled={isCreating}
                    {...registerDetails('title')}
                  />

                  <Textarea
                    label="Brief Description / Context"
                    placeholder="Describe the content. E.g. A collection of scenic clips from my beach hike in Bali, featuring active trekking and panoramic sunset views."
                    error={detailsErrors.description?.message}
                    disabled={isCreating}
                    {...registerDetails('description')}
                  />
                </div>
              </form>
            )}

            {/* Step 2: Upload Media */}
            {currentStep === 2 && projectId && (
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-zinc-100">Upload Media Assets</h3>
                  <p className="text-xs text-zinc-400">Upload raw video clips and photos to combine onto the editing timeline.</p>
                </div>
                <MediaUploader projectId={projectId} />
              </div>
            )}

            {/* Step 3: Background Soundtrack */}
            {currentStep === 3 && projectId && (
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-zinc-100">Soundtrack selection</h3>
                  <p className="text-xs text-zinc-400">Upload a background music track. The Rhythm Engineer will align cuts to the beat.</p>
                </div>
                <AudioUploader projectId={projectId} />
              </div>
            )}

            {/* Step 4: AI Creative Instructions */}
            {currentStep === 4 && projectId && (
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-zinc-100">Configure AI Generation Settings</h3>
                  <p className="text-xs text-zinc-400">Write creative rendering instructions and pick the pacing aesthetic.</p>
                </div>

                <div className="space-y-6">
                  {/* Prompt */}
                  <Textarea
                    label="AI Edit Instruction Prompt"
                    placeholder='E.g. "Create a cinematic travel reel with quick, high-energy cuts synced to the music beats. Focus on panoramic shots and end on a dramatic sunset."'
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isRendering}
                  />

                  {/* Settings Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Duration Select */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Target Duration</label>
                      <select
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value) as 15 | 30 | 60)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                        disabled={isRendering}
                      >
                        <option value={15}>15 Seconds</option>
                        <option value={30}>30 Seconds (Recommended)</option>
                        <option value={60}>60 Seconds</option>
                      </select>
                    </div>

                    {/* Style Select */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Edit Style Theme</label>
                      <select
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                        disabled={isRendering}
                      >
                        <option value="cinematic">Cinematic Grade</option>
                        <option value="travel">Travel Vlog</option>
                        <option value="fast_cut">Fast Cut / Beat Sync</option>
                        <option value="adventure">Adventure</option>
                        <option value="dramatic">Dramatic</option>
                        <option value="funny">Funny/Meme</option>
                        <option value="romantic">Romantic</option>
                        <option value="birthday">Birthday Celebration</option>
                      </select>
                    </div>
                  </div>

                  {/* Caption typography */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Subtitle Font Style</label>
                    <select
                      value={captionStyle}
                      onChange={(e) => setCaptionStyle(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                      disabled={isRendering}
                    >
                      <option value="hormozi">Alex Hormozi (Bold/Emoji Highlights)</option>
                      <option value="clean">Clean Modern</option>
                      <option value="none">No Subtitles burned</option>
                    </select>
                  </div>

                  {/* Toggle controls */}
                  <div className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-4 space-y-3.5 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-300">Speech Subtitles</span>
                        <span className="text-[11px] text-zinc-500">Transcribe voice and burn captions.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={addSubtitles}
                        onChange={(e) => setAddSubtitles(e.target.checked)}
                        className="accent-purple-500 h-4.5 w-4.5 bg-zinc-900 border-zinc-800 rounded"
                        disabled={isRendering}
                      />
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-900 pt-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-300">Curated Asset Overlays</span>
                        <span className="text-[11px] text-zinc-500">Apply professional stickers and visual overlays.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={addStickers}
                        onChange={(e) => setAddStickers(e.target.checked)}
                        className="accent-purple-500 h-4.5 w-4.5 bg-zinc-900 border-zinc-800 rounded"
                        disabled={isRendering}
                      />
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-900 pt-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-300">Title Text Overlays</span>
                        <span className="text-[11px] text-zinc-500">Burn title text overlays designed by AI.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={addTextOverlay}
                        onChange={(e) => setAddTextOverlay(e.target.checked)}
                        className="accent-purple-500 h-4.5 w-4.5 bg-zinc-900 border-zinc-800 rounded"
                        disabled={isRendering}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Wizard Controls */}
        <div className="flex items-center justify-between border-t border-zinc-800/60 pt-6 mt-8">
          <Button
            type="button"
            variant="ghost"
            onClick={handlePrevStep}
            disabled={currentStep === 1 || isCreating || isRendering}
            className="flex items-center gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>

          {currentStep === 4 ? (
            <Button
              type="button"
              variant="primary"
              onClick={handleStartGeneration}
              isLoading={isRendering}
              className="flex items-center gap-1.5"
            >
              <Sparkles className="h-4 w-4 text-purple-300 fill-current animate-pulse" />
              Generate Video
            </Button>
          ) : (
            <Button
              type={currentStep === 1 ? 'submit' : 'button'}
              form={currentStep === 1 ? 'details-form' : undefined}
              variant="primary"
              onClick={currentStep !== 1 ? handleNextStep : undefined}
              isLoading={currentStep === 1 && isCreating}
              className="flex items-center gap-1.5"
            >
              Next Step <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
