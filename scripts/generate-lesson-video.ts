import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { FULL_STACK_MODULES } from '../src/data/curriculum';

interface LessonVideoJob {
  moduleId: string;
  lessonId: string;
  outputDir?: string;
}

export function generateLessonVideo(job: LessonVideoJob) {
  const mod = FULL_STACK_MODULES.find((m) => m.id === job.moduleId);
  if (!mod) throw new Error(`Module not found: ${job.moduleId}`);

  const lesson = mod.lessons.find((l) => l.id === job.lessonId);
  if (!lesson) throw new Error(`Lesson not found: ${job.lessonId}`);

  console.log(`Processing Lesson Pipeline: [${mod.title}] -> [${lesson.title}]`);

  const outDir = job.outputDir || path.join(process.cwd(), 'public/videos/lessons');
  const capDir = path.join(process.cwd(), 'public/captions/lessons');
  const txtDir = path.join(process.cwd(), 'public/transcripts/lessons');
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(capDir, { recursive: true });
  fs.mkdirSync(txtDir, { recursive: true });

  const tmpDir = path.join('/tmp', `seva_lesson_${lesson.id}`);
  fs.mkdirSync(tmpDir, { recursive: true });

  const scriptParts = [
    `Welcome to ${lesson.title}, part of Module ${mod.number}: ${mod.title}.`,
    lesson.conceptExplanation.slice(0, 300),
    `In this lesson, you will master ${lesson.learningObjectives.join(', ')}.`,
    `Review the key takeaways and complete the hands-on practice lab to record your evidence.`
  ];

  const segPaths: string[] = [];
  let totalTime = 0;

  for (let idx = 0; idx < scriptParts.length; idx++) {
    const text = scriptParts[idx];
    const aiffPath = path.join(tmpDir, `aud_${idx}.aiff`);
    const wavPath = path.join(tmpDir, `aud_${idx}.wav`);
    const svgPath = path.join(tmpDir, `slide_${idx}.svg`);
    const pngPath = path.join(tmpDir, `slide_${idx}.png`);
    const segPath = path.join(tmpDir, `seg_${idx}.mp4`);

    // Audio narration
    execSync(`/usr/bin/say -v Samantha "${text.replace(/"/g, '\\"')}" -o "${aiffPath}"`);
    const durOutput = execSync(
      `/opt/homebrew/bin/ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${aiffPath}"`
    ).toString().trim();
    const dur = (parseFloat(durOutput) || 4) + 0.5;
    totalTime += dur;

    execSync(`/opt/homebrew/bin/ffmpeg -y -i "${aiffPath}" -af "apad=pad_dur=0.5" "${wavPath}" > /dev/null 2>&1`);

    // Write slide spec JSON
    const slideSpecJson = {
      moduleNumber: mod.number,
      moduleTitle: mod.title,
      conceptTitle: lesson.title,
      slideIndex: idx,
      totalSlides: scriptParts.length,
      title: lesson.title,
      subtitle: `Module ${mod.number}: ${mod.title} · Step ${idx + 1}`,
      content: [
        text.slice(0, 110),
        `Core Competency: ${mod.primarySkill}`,
        `Lesson Goal: ${lesson.learningObjectives[0] || 'Production engineering proficiency'}`
      ],
      codeSnippet: idx === 1 && lesson.codeExample?.code ? lesson.codeExample.code : undefined,
      calloutType: idx === scriptParts.length - 1 ? 'summary' : 'info',
      calloutText: idx === scriptParts.length - 1 ? 'Complete the interactive lab to record cryptographic evidence.' : `Key Objective: ${lesson.learningObjectives[0] || 'Demonstrate mastery.'}`
    };
    const slideJsonPath = path.join(tmpDir, `slide_${idx}.json`);
    fs.writeFileSync(slideJsonPath, JSON.stringify(slideSpecJson, null, 2));

    execSync(`python3 "${path.join(process.cwd(), 'scripts/render_slide_pillow.py')}" "${slideJsonPath}" "${pngPath}"`);

    // Render segment in 1080p Full HD
    execSync(
      `/opt/homebrew/bin/ffmpeg -y -loop 1 -i "${pngPath}" -i "${wavPath}" -c:v libx264 -tune stillimage -b:v 2500k -c:a aac -b:a 192k -pix_fmt yuv420p -t ${dur.toFixed(2)} -r 25 "${segPath}" > /dev/null 2>&1`
    );
    segPaths.push(segPath);
  }

  // Concatenate
  const concatPath = path.join(tmpDir, 'concat.txt');
  fs.writeFileSync(concatPath, segPaths.map((p) => `file '${p}'`).join('\n'));
  const finalMp4 = path.join(outDir, `${lesson.id}.mp4`);
  execSync(`/opt/homebrew/bin/ffmpeg -y -f concat -safe 0 -i "${concatPath}" -c copy -movflags +faststart "${finalMp4}" > /dev/null 2>&1`);

  // Write WebVTT captions
  let vttTime = 0;
  const vttLines = ['WEBVTT', '', `NOTE Lesson: ${lesson.title}`, ''];
  scriptParts.forEach((part, i) => {
    const startSec = vttTime;
    const endSec = vttTime + totalTime / scriptParts.length;
    vttTime = endSec;

    const fmt = (s: number) => {
      const m = Math.floor(s / 60).toString().padStart(2, '0');
      const sec = Math.floor(s % 60).toString().padStart(2, '0');
      const ms = Math.floor((s % 1) * 1000).toString().padStart(3, '0');
      return `00:${m}:${sec}.${ms}`;
    };

    vttLines.push(`${i + 1}`);
    vttLines.push(`${fmt(startSec)} --> ${fmt(endSec)}`);
    vttLines.push(part);
    vttLines.push('');
  });
  fs.writeFileSync(path.join(capDir, `${lesson.id}.vtt`), vttLines.join('\n'));

  // Write Markdown/TXT transcript
  const transcriptContent = `# ${lesson.title}\n\n**Module**: Module ${mod.number}: ${mod.title}\n**Competency**: ${mod.primarySkill}\n\n## Spoken Narration Transcript\n\n${scriptParts.map((p, i) => `${i + 1}. ${p}`).join('\n\n')}\n`;
  fs.writeFileSync(path.join(txtDir, `${lesson.id}.txt`), transcriptContent);

  console.log(`✓ Lesson Video Rendered: ${finalMp4} (${totalTime.toFixed(1)}s)`);
  return finalMp4;
}

if (process.argv[2] && process.argv[3]) {
  generateLessonVideo({ moduleId: process.argv[2], lessonId: process.argv[3] });
}
