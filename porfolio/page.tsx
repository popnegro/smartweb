import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { cache } from 'react';

interface Props {
  params: Promise<{ slug: string }>;
}

// Helper para obtener la ruta del directorio de contenidos
const getContentsDirectory = () => process.cwd();

// Función centralizada para obtener los datos del proyecto
const getProjectData = cache(async (slug: string) => {
  const postsDirectory = getContentsDirectory();
  const fullPath = path.join(postsDirectory, `${slug}-case-study.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  const processedContent = await remark().use(html).process(content);
  const contentHtml = processedContent.toString();

  return {
    slug,
    metadata: data,
    contentHtml,
  };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectData(slug);

  if (!project) return { title: 'Proyecto no encontrado' };

  return {
    title: `${project.metadata.title || slug.charAt(0).toUpperCase() + slug.slice(1)} | Luis Grasso`,
    description: project.metadata.description || `Caso de estudio del proyecto ${slug}`,
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectData(slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
      <header className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="font-bold text-xl tracking-tight text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            LUIS<span className="text-blue-600">GRASSO</span>
          </Link>
          <Link href="/portfolio" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Todos los proyectos
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 md:py-20 px-6">
        <Link 
          href="/portfolio" 
          className="inline-flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 hover:gap-2 transition-all mb-10 group"
        >
          <span className="mr-2 transition-transform group-hover:-translate-x-1">←</span> 
          Volver al Portfolio
        </Link>
        
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 md:p-12">
          <header className="mb-10 border-b border-slate-100 dark:border-slate-800 pb-10">
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
              {(project.metadata.title as string) || slug.replace('-', ' ')}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 italic">
              {(project.metadata.role as string) || 'Diseño y Desarrollo'}
            </p>
          </header>

          <article className="prose prose-slate lg:prose-xl max-w-none dark:prose-invert
            prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white 
            prose-a:text-blue-600 dark:prose-a:text-blue-400 
            prose-img:rounded-xl prose-img:shadow-lg 
            prose-strong:text-blue-700 dark:prose-strong:text-blue-400
            prose-p:text-slate-600 dark:prose-p:text-slate-300
            prose-ul:list-disc prose-ol:list-decimal">
            <div dangerouslySetInnerHTML={{ __html: project.contentHtml }} />
          </article>
        </div>
      </main>
    </div>
  );
}

export async function generateStaticParams() {
  const contentsDir = getContentsDirectory();
  const files = fs.readdirSync(contentsDir);

  return files
    .filter((file) => file.endsWith('-case-study.md'))
    .map((file) => ({
      slug: file.replace('-case-study.md', ''),
    }));
}