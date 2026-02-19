import type { Metadata } from 'next';
import { Playground } from '@/components/playground/Playground';

export const metadata: Metadata = {
  title: 'API Playground — YouSearch',
  description: 'Build and test YouSearch API queries interactively.',
};

export default function PlaygroundPage() {
  return <Playground />;
}
