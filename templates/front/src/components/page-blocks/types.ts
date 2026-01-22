
export interface BlockContext {
  mode: 'preview' | 'storefront';
  isSelected?: boolean;
  onSelect?: () => void;
}

export interface HeroBlockProps {
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundImage?: string;
  alignment: 'left' | 'center' | 'right';
  overlay?: boolean;
  height?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export interface HeadingBlockProps {
  content: string;
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  alignment: 'left' | 'center' | 'right';
}

export interface TextBlockProps {
  content: string;
  alignment: 'left' | 'center' | 'right';
}

export interface ImageBlockProps {
  src: string;
  alt: string;
  caption?: string;
  width?: 'sm' | 'md' | 'lg' | 'full';
  alignment: 'left' | 'center' | 'right';
  rounded?: boolean;
}

export interface SpacerBlockProps {
  height: 'sm' | 'md' | 'lg' | 'xl';
}

export type BlockPropsWithContext<T> = T & {
  context?: BlockContext;
};
