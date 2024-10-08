import Typer from '@/components/Typer';
import { Sentence } from './types';

async function getSentences() {
  const res = await fetch('https://sentence.underthekey.com/random?count=20', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch sentences');
  }
  return res.json();
}

export default async function Home() {
  const initialSentences: Sentence[] = await getSentences();

  return <Typer initialSentences={initialSentences} />;
}
